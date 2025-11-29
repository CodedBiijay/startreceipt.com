# StartReceipt.com - Project Context

## Project Overview

**StartReceipt.com** is a web application that enables freelancers and contractors to create professional receipts instantly using AI-powered natural language processing. Users can describe their work in plain English, and the app automatically generates a formatted, downloadable PDF receipt.

**Live Project:** https://startreceipt.com
**AI Studio:** https://ai.studio/apps/drive/1BrT8VMTgXQmLvTWeScs7dsD7P4I60mMq

## Technology Stack

### Frontend
- **Framework:** React 19.2.0 with TypeScript 5.8.2
- **Build Tool:** Vite 6.2.0
- **Styling:** Tailwind CSS (via CDN)
- **Icons:** Lucide React 0.554.0
- **Fonts:** Inter (Google Fonts)

### AI Integration
- **Provider:** Google Gemini AI (@google/genai 1.30.0)
- **Model:** gemini-2.0-flash-exp (FREE experimental model)
- **Purpose:** Parse natural language receipt descriptions into structured data
- **Rate Limits:** 15 req/min, 1,500 req/day, 1.5M req/month (free tier)

### PDF Generation
- **Library:** html2canvas (1.4.1) + jsPDF (2.5.2)
- **Method:** NPM packages (not CDN)
- **Installation:** `npm install html2canvas jspdf`

### Additional Libraries
- **Form Handling:** Formspree (https://formspree.io/f/xeodykab)
- **Storage:** LocalStorage (client-side)

### Development
- **Node.js:** Required
- **Dev Server Port:** 3000
- **Scripts:**
  - `npm run dev` - Start development server
  - `npm run build` - Production build
  - `npm run preview` - Preview production build

## Architecture

### Application Structure

```
startreceipt.com/
├── Configuration
│   ├── .env.local              # Environment variables (GEMINI_API_KEY)
│   ├── package.json            # Dependencies and scripts
│   ├── tsconfig.json           # TypeScript config (ES2022, React JSX)
│   ├── vite.config.ts          # Vite config (port 3000, env vars, path aliases)
│   └── .gitignore              # Git ignore rules
│
├── Entry Points
│   ├── index.html              # HTML entry, CDN imports (Tailwind only)
│   ├── index.tsx               # React root renderer
│   └── App.tsx                 # Main app component, landing page, routing
│
├── Type Definitions
│   └── types.ts                # ReceiptItem, ReceiptData, SavedReceipt, User, PricingTier
│
├── Components
│   ├── SmartReceiptDemo.tsx    # AI receipt generator (demo/app modes)
│   ├── Dashboard.tsx           # User dashboard, receipt management
│   ├── AuthModal.tsx           # Sign in/sign up modal (Formspree integration)
│   ├── LeadForm.tsx            # Landing page lead capture
│   ├── FAQ.tsx                 # Frequently asked questions accordion
│   └── UsageAnalytics.tsx      # Admin dashboard for usage tracking
│
├── Services
│   ├── geminiService.ts        # Gemini AI integration with tracking & rate limiting
│   ├── usageTracker.ts         # Track AI generation usage per user
│   └── rateLimiter.ts          # Rate limiting to prevent abuse
│
├── Assets
│   └── public/
│       └── hero-image.png      # Hero section image
│
└── Documentation
    ├── README.md               # Setup instructions
    ├── PROJECT_CONTEXT.md      # This file
    ├── USAGE_TRACKING.md       # Usage tracking & analytics guide
    └── metadata.json           # AI Studio metadata
```

### Data Flow

1. **User Input → AI Processing**
   - User describes work in natural language
   - Text sent to `geminiService.parseReceiptDescription(userEmail, userTier, limit)`
   - **NEW:** Rate limit check before API call
   - **NEW:** Monthly usage limit enforcement
   - Gemini AI extracts structured receipt items (description, quantity, price)
   - **NEW:** Usage tracking for success/failure
   - **NEW:** Error categorization and user-friendly messages

2. **State Management**
   - Parsed items update React state
   - Receipt preview renders in real-time
   - User can edit client name and view live totals

3. **Persistence**
   - **Saved Receipts:** LocalStorage (key: `savedReceipts`)
   - **Usage Data:** LocalStorage (key: `startreceipt_usage`)
   - **User Data:** Mock authentication (no backend)
   - **Form Submissions:** Formspree for lead capture and signup

4. **PDF Export**
   - html2canvas converts receipt preview to canvas
   - jsPDF creates PDF from canvas
   - Downloads directly to user's device
   - **FIXED:** Now uses npm packages instead of CDN for reliability

### Key Components

#### App.tsx (Main Application)
- Landing page with sections: Hero, Features, Problem/Solution, Demo, Pricing, FAQ
- Navigation with smooth scrolling
- State management for user authentication
- Responsive design (mobile/desktop)
- Routes between landing page and dashboard
- **NEW:** Updated copy to be outcome-focused and benefit-driven
- **NEW:** Social proof replaced with industry categories (no fake numbers)
- **NEW:** Hero section image (road ahead)
- **NEW:** AI pricing aligned with tiers (Basic: 50 gens, Pro: unlimited)
- **NEW:** Money-back guarantee added to pricing
- **NEW:** FAQ component integrated

#### SmartReceiptDemo.tsx (Receipt Generator)
- **Modes:**
  - `demo` - Landing page preview (20 AI generations/month limit)
  - `app` - Full dashboard functionality (50 or unlimited based on tier)
- **Props:**
  - `userEmail` - User identifier for tracking
  - `userTier` - 'demo' | 'basic' | 'pro'
  - `mode` - 'demo' | 'app'
  - `onSave` - Save callback
  - `onSignupPrompt` - Trigger signup modal
- AI-powered item extraction with usage tracking
- Live receipt preview
- Editable fields (client name, items)
- **NEW:** PDF download via html2canvas + jsPDF (npm packages)
- **NEW:** Soft signup prompt modal on download in demo mode
- **NEW:** "Just Download" escape hatch option
- Save to localStorage

#### geminiService.ts (AI Service)
- Connects to Google Gemini AI
- Model: gemini-2.0-flash-exp (FREE during preview)
- **NEW:** Function signature updated:
  ```typescript
  parseReceiptDescription(
    text: string,
    userEmail: string = 'demo@user.com',
    userTier: 'demo' | 'basic' | 'pro' = 'demo',
    monthlyLimit: number = 20
  )
  ```
- **NEW:** Rate limiting checks (3-5 req/min based on tier)
- **NEW:** Monthly usage limit enforcement
- **NEW:** Comprehensive error handling and categorization
- **NEW:** Usage tracking for all requests
- **NEW:** Low generation count warnings
- **NEW:** Quota exceeded detection
- Structured JSON output with schema validation
- Extracts: item descriptions, quantities, unit prices

#### usageTracker.ts (NEW - Usage Tracking)
- Tracks every AI generation attempt
- Records success/failure, error types
- Per-user statistics (monthly, daily, total)
- Monthly limit enforcement
- Token usage estimation
- CSV export functionality
- LocalStorage persistence
- **Methods:**
  - `track(userEmail, success, errorType)` - Record generation
  - `getUserStats(userEmail)` - Get user's statistics
  - `hasExceededMonthlyLimit(userEmail, limit)` - Check limits
  - `getRemainingGenerations(userEmail, limit)` - Get remaining
  - `getAllStats()` - Admin analytics
  - `exportCSV()` - Export data

#### rateLimiter.ts (NEW - Rate Limiting)
- Prevents abuse with time-based limits
- **Demo Users:** 3/min, 10/hour, 20/day
- **Paid Users:** 5/min, 30/hour, 100/day
- User-friendly error messages with retry timing
- In-memory tracking (per session)
- **Methods:**
  - `checkLimit(userEmail, isDemo)` - Check if request allowed
  - `recordRequest(userEmail)` - Record successful request
  - `getUsage(userEmail)` - Get current usage
  - `clearUser(userEmail)` - Admin function

#### UsageAnalytics.tsx (NEW - Admin Dashboard)
- Beautiful analytics dashboard
- Real-time metrics display
- **Metrics:**
  - Total generations (all time)
  - Success rate percentage
  - Unique users count
  - Failed requests
  - Today/week/month breakdowns
  - Cost estimates (token-based)
  - Error breakdown by type
- CSV export button
- Auto-refreshes every 5 seconds
- Mobile-responsive design

#### FAQ.tsx (NEW - FAQ Section)
- Accordion-style FAQ component
- 7 common questions answered
- Addresses objections before signup
- Clean, modern design
- Mobile-responsive

### Brand Identity

**Colors:**
- Primary Blue: `#2257F5` (brand-blue)
- Dark Blue: `#112D82` (brand-dark)
- Light Blue: `#EBF1FF` (brand-light)

**Typography:** Inter (sans-serif)

**Messaging:**
- Value proposition: "Get Paid Faster, Skip the Paperwork"
- Target audience: Freelancers, contractors, small business owners
- Tone: Authentic, helpful, not spammy

## Key Decisions and Rationale

### 1. Client-Side Architecture
**Decision:** No backend, fully client-side application
**Rationale:**
- Faster development and deployment
- Lower hosting costs
- Instant responsiveness
- Formspree handles form submissions
- LocalStorage sufficient for receipt persistence
- **NEW:** Usage tracking works client-side for MVP

### 2. Google Gemini AI
**Decision:** Use Gemini 2.0 Flash Experimental
**Rationale:**
- **FREE** during experimental period (no cost!)
- Advanced natural language understanding
- Structured output support
- Easy integration with @google/genai SDK
- When it becomes paid: ~$0.00004-$0.00008 per receipt (negligible)

### 3. Vite + React
**Decision:** Vite as build tool instead of Create React App
**Rationale:**
- Faster dev server startup
- Hot Module Replacement (HMR)
- Modern ES modules
- Better TypeScript support
- Smaller bundle sizes

### 4. NPM Packages for PDF
**Decision:** Use html2canvas + jsPDF via npm (not CDN)
**Rationale:**
- More reliable than CDN loading
- Better TypeScript support
- Proper module imports
- No CORS issues
- Easier debugging

### 5. LocalStorage for Persistence
**Decision:** Use LocalStorage for usage tracking and receipts
**Rationale:**
- No backend required
- Instant save/load
- Privacy-friendly (data stays on device)
- Sufficient for MVP and early users
- GDPR-friendly

### 6. Authentic Marketing
**Decision:** Remove fake social proof numbers, use honest messaging
**Rationale:**
- Builds trust with users
- No misleading claims
- Shows industry use cases instead of fake user counts
- Aligns with authentic brand voice

### 7. Soft Conversion Tactics
**Decision:** Add value before asking for signup
**Rationale:**
- Users can try demo without signup
- Soft prompt after demo download with escape hatch
- Benefit-focused messaging
- Money-back guarantee reduces risk
- FAQ addresses objections

## Current State of Work

### Implemented Features ✓

**Core Functionality:**
- ✓ Landing page with marketing sections
- ✓ AI-powered receipt generation (Gemini 2.0 Flash)
- ✓ PDF export functionality (html2canvas + jsPDF)
- ✓ Receipt preview with live updates
- ✓ Client-side receipt storage (LocalStorage)
- ✓ Dashboard interface
- ✓ Authentication modal (mock login)
- ✓ Responsive design
- ✓ Brand styling (custom Tailwind colors)

**NEW - Copy & Design Improvements:**
- ✓ Hero headline rewritten (outcome-focused)
- ✓ Social proof replaced (no fake numbers)
- ✓ Features rewritten (benefit-driven)
- ✓ FAQ component added (7 questions)
- ✓ Demo section enhanced with callout
- ✓ Pricing aligned with AI limits
- ✓ Money-back guarantee added
- ✓ Hero section image updated
- ✓ Soft signup prompt modal
- ✓ Benefit reminder in auth modal

**NEW - Usage Tracking & Analytics:**
- ✓ Usage tracking service (usageTracker.ts)
- ✓ Rate limiting service (rateLimiter.ts)
- ✓ Enhanced error handling in geminiService
- ✓ Admin analytics dashboard (UsageAnalytics.tsx)
- ✓ CSV export functionality
- ✓ Monthly usage limit enforcement
- ✓ Low generation count warnings
- ✓ Quota exceeded detection
- ✓ Comprehensive error categorization
- ✓ Token usage estimation
- ✓ Cost projections

### Pricing Tiers & Limits

| Tier | Price | AI Generations | Rate Limit | Features |
|------|-------|----------------|------------|----------|
| Demo | FREE | 20/month | 3/min | Try before signup |
| Basic | $9/mo | 50/month | 5/min | Unlimited manual receipts |
| Pro | $19/mo | Unlimited | 5/min | All features + priority support |

**Cost Analysis:**
- Current: $0.00 (Gemini 2.0 Flash is FREE)
- Future: ~$0.00004-$0.00008 per receipt
- Profit margin: 99%+ on all tiers

### Known Limitations
- Mock authentication (no real user accounts)
- No backend server
- Data stored only in browser LocalStorage
- No payment processing (pricing page is informational)
- No email/notification system
- Limited receipt customization options
- Usage tracking resets if browser data cleared

### Configuration Status
- ✓ TypeScript configured
- ✓ Vite configured (port 3000)
- ✓ Tailwind CSS configured (custom colors)
- ✓ Path aliases set up (`@/*`)
- ✓ Environment variable configured (GEMINI_API_KEY)
- ✓ Formspree integration active
- ✓ html2canvas + jsPDF installed via npm
- ✓ Usage tracking operational
- ✓ Rate limiting active

## Next Steps / TODO

### Immediate Priorities

1. **Testing & QA**
   - ✓ Test receipt generation with various input formats
   - ✓ Verify PDF generation across browsers
   - ✓ Test responsive design on mobile devices
   - ✓ Validate localStorage persistence
   - Test usage tracking analytics
   - Test rate limiting behavior
   - Test error handling for quota exceeded

2. **Monitoring Setup**
   - Set up Google Cloud Console billing alerts
   - Monitor Gemini API usage daily (first week)
   - Export CSV weekly for records
   - Watch for Gemini 2.0 Flash graduation from experimental

3. **Deployment Preparation**
   - Run production build (`npm run build`)
   - Test production preview
   - Set up hosting (Vercel, Netlify, or similar)
   - Configure environment variables for production
   - Add admin route for UsageAnalytics component

### Future Enhancements

4. **Backend Integration (When Scaling)**
   - Real user authentication system
   - Database for receipt storage
   - Server-side usage tracking (more reliable)
   - Email delivery for receipts
   - Payment processing for premium features
   - Stripe integration for subscriptions

5. **Feature Improvements**
   - Multiple receipt templates
   - Custom branding options (logo upload)
   - Tax calculation support
   - Currency selection
   - Invoice numbering system
   - Receipt sharing via link
   - Bulk receipt generation
   - Receipt editing after save

6. **Analytics Enhancements**
   - Add Google Analytics or Plausible
   - Error tracking (Sentry)
   - User behavior monitoring
   - Conversion tracking for signup form
   - A/B testing different prompts
   - Performance metrics (response time)
   - User satisfaction ratings

7. **SEO & Marketing**
   - Meta tags optimization
   - Open Graph images
   - Blog/content marketing
   - Social media integration
   - Testimonials and case studies

8. **Performance Optimization**
   - Code splitting
   - Image optimization
   - Lazy loading for components
   - Bundle size analysis
   - Caching strategies

### Development Workflow

```bash
# Setup
npm install
# Add GEMINI_API_KEY to .env.local

# Development
npm run dev
# Visit http://localhost:3000

# View Usage Analytics
# Add route in App.tsx for UsageAnalytics component
# Access admin dashboard

# Production
npm run build
npm run preview
```

## File Reference Quick Guide

| Purpose | File Path |
|---------|-----------|
| Main app component | `App.tsx` |
| Receipt generator | `components/SmartReceiptDemo.tsx` |
| Dashboard | `components/Dashboard.tsx` |
| FAQ section | `components/FAQ.tsx` |
| Usage analytics | `components/UsageAnalytics.tsx` |
| AI service | `services/geminiService.ts` |
| Usage tracking | `services/usageTracker.ts` |
| Rate limiting | `services/rateLimiter.ts` |
| Type definitions | `types.ts` |
| Vite config | `vite.config.ts` |
| Environment vars | `.env.local` |
| Dependencies | `package.json` |
| Tracking docs | `USAGE_TRACKING.md` |

## Error Types Tracked

- `quota_exceeded` - Google API quota limit reached
- `api_rate_limit` - Too many requests to Gemini API
- `rate_limit_exceeded` - App-level rate limit hit
- `monthly_limit_exceeded` - User's tier limit reached
- `missing_api_key` - API key not configured
- `invalid_api_key` - API key authentication failed
- `network_error` - Connection issues
- `json_parse_error` - Failed to parse AI response
- `empty_response` - API returned no data
- `empty_result` - AI generated empty array

## Getting Help

- **Setup Issues:** Check README.md for installation steps
- **API Issues:** Verify GEMINI_API_KEY in .env.local
- **PDF Issues:** Check browser console for html2canvas/jsPDF errors
- **Usage Tracking:** See USAGE_TRACKING.md for detailed guide
- **Build Issues:** Check Vite documentation
- **TypeScript Issues:** Review tsconfig.json settings

---

**Last Updated:** 2025-11-27
**Project Status:** Production Ready with Analytics
**Current Version:** 2.0 (with usage tracking & analytics)
**Next Milestone:** Deploy to production, monitor usage, set up billing alerts
