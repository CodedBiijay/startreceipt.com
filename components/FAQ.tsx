import React, { useState } from 'react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Do I need to install anything?",
      a: "Nope. StartReceipt works entirely in your browser. No downloads, no installations, no updates. It works on your phone, tablet, or computer."
    },
    {
      q: "Where does my data go?",
      a: "Nowhere. Your receipts and invoices are generated locally on your device. We don't store your financial data on any servers. If you save a document, it's stored in your browser's local storage—you're in control."
    },
    {
      q: "How does the AI actually work?",
      a: "You type a description like 'I fixed a sink for 2 hours at $85/hr and charged $15 for parts.' Our AI (powered by Google Gemini) extracts the structured data (labor: 2hrs × $85, parts: $15) and formats it into professional line items. The free plan includes 50 AI generations per month."
    },
    {
      q: "Can I create invoices too, or just receipts?",
      a: "Yes! You can create both receipts (proof of payment) and invoices (payment requests). Invoices include due dates, payment terms, and status tracking (Draft, Sent, Paid, Overdue). Just toggle between Receipt and Invoice mode when creating a document."
    },
    {
      q: "What's the difference between a receipt and an invoice?",
      a: "A receipt confirms payment has been received, while an invoice requests payment. Receipts are automatically marked as 'Paid'. Invoices let you track status (Draft, Sent, Paid, Overdue) and include due dates and payment terms."
    },
    {
      q: "What are the Pro branding features?",
      a: "Pro users can add their business logo, customize brand colors, and include business information (business name, email, phone, address, tax ID) on all documents. This makes your invoices and receipts look professional and builds trust with clients."
    },
    {
      q: "How does invoice status tracking work?",
      a: "When you create an invoice, you can save it as Draft, mark it as Sent when you send it to clients, or mark it as Paid when payment is received. The dashboard automatically flags invoices as Overdue if they're past the due date and still unpaid."
    },
    {
      q: "What happens when I hit the 50 AI generation limit on the free plan?",
      a: "You can still create unlimited receipts and invoices manually, or upgrade to Pro for unlimited AI generations plus custom branding and client management."
    },
    {
      q: "What happens if I cancel Pro?",
      a: "You keep all your documents and can still create unlimited receipts and invoices on the free plan. You just lose Pro features like custom branding, unlimited AI generations, and advanced client management."
    },
    {
      q: "Is this compliant for taxes?",
      a: "StartReceipt creates professional documents with dates, itemized charges, totals, and tax calculations. However, we're not CPAs—consult your accountant about your specific tax situation."
    },
    {
      q: "Can I access my documents from different devices?",
      a: "Since documents are stored locally in your browser, they're device-specific. We recommend downloading PDFs of important documents and storing them in your preferred cloud storage (Google Drive, Dropbox, etc.) for access across devices."
    }
  ];

  return (
    <section id="faq" className="py-24 px-4 bg-slate-50">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
          Questions You Might Have
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <span className="font-bold text-slate-900 pr-4">{faq.q}</span>
                <span className="text-brand-blue text-2xl shrink-0">{openIndex === i ? '−' : '+'}</span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
