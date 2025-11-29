# Usage Tracking & Rate Limiting

This document explains the usage tracking, rate limiting, and analytics features implemented for AI receipt generation.

## Features Implemented

### 1. **Usage Tracking** (`services/usageTracker.ts`)

Tracks every AI generation attempt with detailed metrics:

- ✅ Success/failure tracking
- ✅ Error categorization
- ✅ Per-user statistics
- ✅ Monthly/daily usage limits
- ✅ Token usage estimation
- ✅ CSV export for analytics

**Usage:**
```typescript
import { usageTracker } from './services/usageTracker';

// Get user's current stats
const stats = usageTracker.getUserStats('user@example.com');
console.log(`Monthly generations: ${stats.monthlyGenerations}`);

// Check if user exceeded limit
const exceeded = usageTracker.hasExceededMonthlyLimit('user@example.com', 50);

// Get remaining generations
const remaining = usageTracker.getRemainingGenerations('user@example.com', 50);
```

### 2. **Rate Limiting** (`services/rateLimiter.ts`)

Prevents abuse with multi-tier rate limits:

**Demo Users:**
- 3 requests per minute
- 10 requests per hour
- 20 requests per day

**Paid Users:**
- 5 requests per minute
- 30 requests per hour
- 100 requests per day

**Usage:**
```typescript
import { rateLimiter } from './services/rateLimiter';

// Check if request is allowed
const check = rateLimiter.checkLimit('user@example.com', false);
if (!check.allowed) {
  console.log(check.reason);
  console.log(`Retry after ${check.retryAfter} seconds`);
}

// Record successful request
rateLimiter.recordRequest('user@example.com');
```

### 3. **Enhanced Error Handling** (`services/geminiService.ts`)

Comprehensive error categorization and user-friendly messages:

- ✅ API quota exceeded
- ✅ Rate limit errors
- ✅ Invalid API key
- ✅ Network errors
- ✅ Parse errors
- ✅ Empty responses

**Error Types Tracked:**
- `quota_exceeded` - Google API quota limit reached
- `api_rate_limit` - Too many requests to Gemini API
- `rate_limit_exceeded` - App-level rate limit
- `monthly_limit_exceeded` - User's monthly tier limit
- `missing_api_key` - API key not configured
- `invalid_api_key` - API key authentication failed
- `network_error` - Connection issues
- `json_parse_error` - Failed to parse AI response
- `empty_response` - API returned no data
- `empty_result` - AI generated empty array

### 4. **Usage Analytics Dashboard** (`components/UsageAnalytics.tsx`)

Beautiful admin dashboard showing:

- 📊 Total generations (all time)
- ✅ Success rate percentage
- 👥 Unique users count
- ❌ Failed requests
- 📅 Today/week/month breakdowns
- 💰 Cost estimates (based on Gemini pricing)
- 📉 Error breakdown by type
- 📥 CSV export functionality
- 🔄 Auto-refresh every 5 seconds

**Usage:**
```tsx
import { UsageAnalytics } from './components/UsageAnalytics';

// Add to your admin route
<UsageAnalytics />
```

## Integration Guide

### Updated Function Signature

The `parseReceiptDescription` function now accepts additional parameters:

```typescript
parseReceiptDescription(
  text: string,                              // Receipt description
  userEmail: string = 'demo@user.com',       // User identifier
  userTier: 'demo' | 'basic' | 'pro' = 'demo', // Subscription tier
  monthlyLimit: number = 20                  // Monthly generation limit
): Promise<ReceiptItem[]>
```

### SmartReceiptDemo Component

Updated to pass user context:

```tsx
<SmartReceiptDemo
  mode="app"
  userEmail="user@example.com"
  userTier="basic"  // or 'demo' or 'pro'
  onSave={handleSave}
/>
```

### Tier Limits

| Tier | Monthly Limit | Rate Limit (per minute) | Price |
|------|---------------|-------------------------|-------|
| Demo | 20 generations | 3 requests/min | Free |
| Basic | 50 generations | 5 requests/min | $9/mo |
| Pro | Unlimited | 5 requests/min | $19/mo |

## Cost Monitoring

### Current Status (Gemini 2.0 Flash Experimental)
- **Cost**: $0.00 (FREE during preview)
- **Rate Limits**: 15 req/min, 1,500 req/day, 1.5M req/month

### Future Pricing (when it goes stable)
Based on typical Gemini Flash pricing:
- **Input**: ~$0.075 per 1M tokens
- **Output**: ~$0.30 per 1M tokens
- **Per Receipt**: ~$0.00004 - $0.00008

### Profit Margins

**Basic Plan ($9/month):**
- 50 generations × $0.00006 = $0.003 cost
- **Margin**: 99.97%

**Pro Plan ($19/month):**
- Even at 1,000 generations/month = $0.06 cost
- **Margin**: 99.7%

## Viewing Analytics

### Option 1: In-App Dashboard

Add a route to your App:

```tsx
import { UsageAnalytics } from './components/UsageAnalytics';

// In your router or conditional rendering:
{isAdmin && <UsageAnalytics />}
```

### Option 2: Browser Console

```javascript
// Get all stats
import { usageTracker } from './services/usageTracker';
console.log(usageTracker.getAllStats());

// Get specific user stats
console.log(usageTracker.getUserStats('user@example.com'));

// Export to CSV
const csv = usageTracker.exportCSV();
console.log(csv);
```

### Option 3: LocalStorage

All data is stored in `localStorage` under key `startreceipt_usage`. You can:

```javascript
// View raw data
const data = localStorage.getItem('startreceipt_usage');
console.log(JSON.parse(data));

// Clear all data
localStorage.removeItem('startreceipt_usage');
```

## Alerts & Notifications

The system automatically shows alerts to users:

1. **Low Generation Warning**: When ≤3 generations remaining
2. **Rate Limit**: When too many requests in short time
3. **Monthly Limit**: When tier limit exceeded
4. **API Errors**: User-friendly error messages

## Data Privacy

- All tracking data stored **locally** in browser's localStorage
- No data sent to external servers
- User can clear data anytime
- Survives page refresh but cleared on browser data clear

## Monitoring Best Practices

1. **Check analytics daily** to spot unusual patterns
2. **Export CSV weekly** for long-term records
3. **Monitor error rates** - high failures indicate API issues
4. **Watch cost estimates** as usage scales
5. **Set up alerts** when approaching API quotas

## Future Enhancements

Potential improvements:

- [ ] Server-side tracking (more reliable)
- [ ] Email notifications for quota alerts
- [ ] Grafana/Datadog integration
- [ ] Usage-based billing automation
- [ ] A/B testing different prompts
- [ ] Performance metrics (response time)
- [ ] User satisfaction ratings

## Troubleshooting

**Q: Analytics not showing data?**
A: Check browser console for errors and verify localStorage isn't disabled.

**Q: Rate limits too strict?**
A: Adjust in `services/rateLimiter.ts` - modify `DEFAULT_CONFIG` values.

**Q: Need to clear a user's limit?**
A: Use `rateLimiter.clearUser('user@email.com')` in console.

**Q: Export not working?**
A: Check browser console - may be popup blocker or download restrictions.

## Support

For issues or questions:
- Check browser console for detailed logs
- Review error types in analytics dashboard
- Export CSV for detailed analysis
- Contact support with specific error messages
