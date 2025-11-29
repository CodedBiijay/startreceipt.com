import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptItem } from "../types";
import { usageTracker } from "./usageTracker";
import { rateLimiter } from "./rateLimiter";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
  console.error("⚠️ Gemini API key is not configured. Please add your API key to .env.local");
}

const genAI = new GoogleGenAI({ apiKey: apiKey || '' });

export const parseReceiptDescription = async (
  text: string,
  userEmail: string = 'demo@user.com',
  userTier: 'demo' | 'basic' | 'pro' = 'demo',
  monthlyLimit: number = 20
): Promise<ReceiptItem[]> => {
  // Check API key
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    console.error("Cannot generate receipt: API key is missing or invalid");
    alert("AI generation is not configured. Please add your Gemini API key to .env.local");
    usageTracker.track(userEmail, false, 'missing_api_key');
    return [];
  }

  // Check rate limits
  const rateLimitCheck = rateLimiter.checkLimit(userEmail, userTier === 'demo');
  if (!rateLimitCheck.allowed) {
    console.warn("Rate limit exceeded:", rateLimitCheck.reason);
    alert(rateLimitCheck.reason);
    usageTracker.track(userEmail, false, 'rate_limit_exceeded');
    return [];
  }

  // Check monthly usage limit (except for Pro tier which is unlimited)
  if (userTier !== 'pro' && usageTracker.hasExceededMonthlyLimit(userEmail, monthlyLimit)) {
    const remaining = usageTracker.getRemainingGenerations(userEmail, monthlyLimit);
    const message = `You've reached your monthly limit of ${monthlyLimit} AI generations. ${
      userTier === 'demo'
        ? 'Sign up for a free account to get 50 generations per month!'
        : 'Upgrade to Pro for unlimited AI generations!'
    }`;
    console.warn(message);
    alert(message);
    usageTracker.track(userEmail, false, 'monthly_limit_exceeded');
    return [];
  }

  try {
    const prompt = `Extract receipt line items from the following description. If a quantity isn't specified, assume 1. If a price isn't specified, estimate a reasonable placeholder or set to 0. Return ONLY a valid JSON array with no additional text or markdown formatting.

Description: "${text}"

Return format example:
[
  {"description": "Item name", "quantity": 1, "price": 10.00}
]`;

    console.log("Sending prompt to Gemini:", prompt);

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING, description: "A short description of the item or service" },
              quantity: { type: Type.NUMBER, description: "The count or hours of the item" },
              price: { type: Type.NUMBER, description: "The cost per unit" }
            },
            required: ["description", "quantity", "price"]
          }
        }
      }
    });

    console.log("Raw Gemini response:", response);
    console.log("Response keys:", Object.keys(response));
    console.log("Response type:", typeof response);

    // Try to get the text content
    let resultText = '';

    // Check if response.text is a method
    if (response.text && typeof response.text === 'function') {
      resultText = response.text();
      console.log("Got text from response.text() method:", resultText);
    }
    // Check if response.text is a property
    else if (response.text && typeof response.text === 'string') {
      resultText = response.text;
      console.log("Got text from response.text property:", resultText);
    }
    // Check nested response
    else if (response.response && typeof response.response.text === 'function') {
      resultText = response.response.text();
      console.log("Got text from response.response.text() method:", resultText);
    }
    else if (response.response && typeof response.response.text === 'string') {
      resultText = response.response.text;
      console.log("Got text from response.response.text property:", resultText);
    }
    // Check candidates array
    else if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      console.log("First candidate:", candidate);
      if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
        resultText = candidate.content.parts[0].text;
        console.log("Got text from candidates[0].content.parts[0].text:", resultText);
      }
    }

    if (!resultText) {
      console.error("Could not extract text from response");
      console.error("Full response structure:", JSON.stringify(response, null, 2));
      alert("AI generation succeeded but returned no data. Check console for details.");
      usageTracker.track(userEmail, false, 'empty_response');
      return [];
    }

    console.log("Final extracted text:", resultText);

    // Parse the JSON
    try {
      const parsed = JSON.parse(resultText) as ReceiptItem[];
      console.log("Successfully parsed items:", parsed);

      if (!parsed || parsed.length === 0) {
        console.warn("Parsed successfully but got empty array");
        usageTracker.track(userEmail, false, 'empty_result');
        return [];
      }

      // Success! Track usage and record rate limit
      rateLimiter.recordRequest(userEmail);
      usageTracker.track(userEmail, true);

      // Show remaining generations to user
      const remaining = usageTracker.getRemainingGenerations(userEmail, monthlyLimit);
      if (userTier !== 'pro' && remaining <= 10) {
        console.log(`⚠️ Low generation count: ${remaining} remaining this month`);
        if (remaining <= 3) {
          setTimeout(() => {
            alert(`You have ${remaining} AI generations remaining this month. ${
              userTier === 'demo'
                ? 'Sign up for free to get 50 per month!'
                : 'Upgrade to Pro for unlimited generations!'
            }`);
          }, 1000);
        }
      }

      return parsed;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Text that failed to parse:", resultText);
      alert(`Failed to parse AI response as JSON. Check console for details.`);
      usageTracker.track(userEmail, false, 'json_parse_error');
      return [];
    }
  } catch (error) {
    console.error("Gemini API error:", error);

    let errorType = 'unknown_error';
    let userMessage = 'Unknown error';

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // Categorize error types
      if (error.message.includes('quota') || error.message.includes('QUOTA_EXCEEDED')) {
        errorType = 'quota_exceeded';
        userMessage = 'API quota exceeded. The service is temporarily unavailable. Please try again later or contact support.';
      } else if (error.message.includes('rate limit') || error.message.includes('RATE_LIMIT_EXCEEDED')) {
        errorType = 'api_rate_limit';
        userMessage = 'Too many requests to the API. Please wait a moment and try again.';
      } else if (error.message.includes('API key') || error.message.includes('INVALID_API_KEY')) {
        errorType = 'invalid_api_key';
        userMessage = 'API configuration error. Please contact support.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorType = 'network_error';
        userMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        userMessage = error.message;
      }
    }

    alert(`AI generation failed: ${userMessage}. Please check the browser console for details.`);
    usageTracker.track(userEmail, false, errorType);
    return [];
  }
};
