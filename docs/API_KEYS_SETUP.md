# API Keys Setup Guide

## Overview

Guide for configuring NFL data API keys for production deployment.

## ESPN API

ESPN provides free access to NFL data without requiring API keys.

### Configuration

```bash
# Environment variables
ESPN_API_BASE_URL="https://site.api.espn.com/apis/site/v2/sports/football/nfl"
ESPN_API_TIMEOUT="10000"
```

### Rate Limits

- **Free tier**: ~60 requests per minute
- **No authentication required**
- **Available data**: Team stats, standings, schedules, basic injury data

### Endpoints Used

```typescript
// Team statistics
GET /teams/{teamId}

// League standings
GET /standings

// Schedule/scoreboard
GET /scoreboard?seasontype=2&week={week}

// Team roster and injuries
GET /teams/{teamId}/roster
GET /teams/{teamId}/injuries
```

## MySportsFeeds API

Premium service with comprehensive NFL data including detailed injury reports.

### Account Setup

1. Visit [MySportsFeeds.com](https://www.mysportsfeeds.com)
2. Create account
3. Choose subscription plan:
   - **Free**: 250 requests/month
   - **Basic**: $9.99/month - 10,000 requests
   - **Premium**: $49.99/month - 100,000 requests

### API Key Configuration

```bash
# Environment variables
MYSPORTSFEEDS_API_KEY="your-api-key-here"
MYSPORTSFEEDS_API_URL="https://api.mysportsfeeds.com/v2.1/pull/nfl"
```

### Authentication

MySportsFeeds uses HTTP Basic Authentication:

```typescript
const auth = Buffer.from(`${apiKey}:MYSPORTSFEEDS`).toString('base64')
headers: {
  'Authorization': `Basic ${auth}`
}
```

### Available Data

- **Enhanced injury reports** with probability ratings
- **Detailed player statistics**
- **Advanced team metrics**
- **Historical matchup data**

### Endpoints Used

```typescript
// Season injuries
GET /{season}-regular/injuries.json

// Team-specific injuries
GET /{season}-regular/injuries.json?team={teamAbbr}

// Player details
GET /{season}-regular/players.json
```

## Production Configuration

### Environment Setup

#### Required Variables

```bash
# ESPN (Free - Always enabled)
ESPN_API_BASE_URL="https://site.api.espn.com/apis/site/v2/sports/football/nfl"
ESPN_API_TIMEOUT="10000"

# MySportsFeeds (Optional - Enhanced data)
MYSPORTSFEEDS_API_KEY=""  # Leave empty to disable
MYSPORTSFEEDS_API_URL="https://api.mysportsfeeds.com/v2.1/pull/nfl"
```

#### Vercel Configuration

```bash
# Add to Vercel environment variables
vercel env add MYSPORTSFEEDS_API_KEY production
```

#### Docker Configuration

```bash
# Add to .env file
echo "MYSPORTSFEEDS_API_KEY=your-key-here" >> .env.production
```

### Fallback Strategy

The system automatically falls back when APIs are unavailable:

1. **MySportsFeeds available**: Uses enhanced injury data
2. **Only ESPN available**: Uses basic injury data
3. **No APIs available**: Shows mock data with clear indicators

```typescript
// Automatic fallback logic
async getInjuryData(teamId: string) {
  try {
    // Try MySportsFeeds first (if configured)
    if (this.msfProvider.isConfigured()) {
      const result = await this.msfProvider.getInjuriesForTeam(teamId)
      if (result.success) return result
    }

    // Fallback to ESPN
    return await this.espnProvider.getInjuriesForTeam(teamId)
  } catch (error) {
    // Return unavailable indicator
    return { success: false, dataSource: 'UNAVAILABLE' }
  }
}
```

## Rate Limit Management

### ESPN Rate Limits

- **Limit**: ~60 requests/minute
- **Handling**: Built-in retry with exponential backoff
- **Caching**: 4-hour cache for team data, 2-hour cache for injuries

### MySportsFeeds Rate Limits

- **Free**: 250 requests/month
- **Paid**: Based on plan (10K-100K/month)
- **Handling**: Request queuing and intelligent caching

### Implementation

```typescript
class RateLimitManager {
  private requestCounts: Map<string, number[]> = new Map()

  async checkRateLimit(provider: string, limit: number): Promise<boolean> {
    const now = Date.now()
    const windowStart = now - 60 * 1000 // 1 minute window

    const requests = this.requestCounts.get(provider) || []
    const recentRequests = requests.filter((time) => time > windowStart)

    if (recentRequests.length >= limit) {
      return false // Rate limit exceeded
    }

    recentRequests.push(now)
    this.requestCounts.set(provider, recentRequests)
    return true
  }
}
```

## Monitoring and Alerts

### API Usage Tracking

```sql
-- Create monitoring query
SELECT
  provider,
  endpoint,
  COUNT(*) as request_count,
  AVG(response_time_ms) as avg_response_time,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as success_count
FROM data_source_logs
WHERE timestamp > NOW() - INTERVAL '1 day'
GROUP BY provider, endpoint;
```

### Alert Configuration

```typescript
// Monitor API health
async checkAPIHealth() {
  const espnHealth = await this.espnProvider.healthCheck()
  const msfHealth = await this.msfProvider.healthCheck()

  if (!espnHealth) {
    await this.sendAlert('ESPN API is down')
  }

  if (this.msfProvider.isConfigured() && !msfHealth) {
    await this.sendAlert('MySportsFeeds API is down')
  }
}
```

### Cost Monitoring

```typescript
// Track MySportsFeeds usage
async trackAPIUsage(provider: string, endpoint: string) {
  await prisma.dataSourceLog.create({
    data: {
      provider,
      endpoint,
      timestamp: new Date(),
      // This helps track monthly usage for billing
    }
  })
}
```

## Security Best Practices

### API Key Storage

```bash
# Never commit API keys to git
echo "*.env*" >> .gitignore
echo "MYSPORTSFEEDS_API_KEY=*" >> .gitignore

# Use environment variables or secret management
export MYSPORTSFEEDS_API_KEY="your-key"

# Or use cloud secret management
aws ssm get-parameter --name "/poolmanager/mysportsfeeds-key"
```

### Key Rotation

```bash
#!/bin/bash
# rotate-api-keys.sh

# Generate new MySportsFeeds key from dashboard
NEW_KEY="new-api-key"

# Update environment variable
vercel env rm MYSPORTSFEEDS_API_KEY production
vercel env add MYSPORTSFEEDS_API_KEY production <<< "$NEW_KEY"

# Redeploy to use new key
vercel --prod
```

### Access Logging

```typescript
// Log all API requests for security audit
async makeRequest(endpoint: string, apiKey?: string) {
  const startTime = Date.now()

  try {
    const response = await fetch(endpoint, {
      headers: apiKey ? { 'Authorization': `Basic ${apiKey}` } : {}
    })

    // Log successful request (without sensitive data)
    await this.logRequest({
      endpoint: this.sanitizeUrl(endpoint),
      success: true,
      responseTime: Date.now() - startTime
    })

    return response
  } catch (error) {
    // Log failed request
    await this.logRequest({
      endpoint: this.sanitizeUrl(endpoint),
      success: false,
      error: error.message
    })
    throw error
  }
}
```

## Testing

### API Key Validation

```typescript
// Test script for API keys
async function validateAPIKeys() {
  console.log('🔍 Validating API keys...')

  // Test ESPN (no key required)
  try {
    const espnTest = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams?limit=1'
    )
    console.log('✅ ESPN API accessible')
  } catch (error) {
    console.log('❌ ESPN API failed:', error.message)
  }

  // Test MySportsFeeds (if key provided)
  if (process.env.MYSPORTSFEEDS_API_KEY) {
    try {
      const auth = Buffer.from(
        `${process.env.MYSPORTSFEEDS_API_KEY}:MYSPORTSFEEDS`
      ).toString('base64')
      const msfTest = await fetch(
        'https://api.mysportsfeeds.com/v2.1/pull/nfl/2024-regular/injuries.json?limit=1',
        {
          headers: { Authorization: `Basic ${auth}` },
        }
      )

      if (msfTest.ok) {
        console.log('✅ MySportsFeeds API accessible')
      } else {
        console.log('❌ MySportsFeeds API failed:', msfTest.status)
      }
    } catch (error) {
      console.log('❌ MySportsFeeds API failed:', error.message)
    }
  } else {
    console.log('⚠️  MySportsFeeds API key not configured (using ESPN only)')
  }
}
```

### Pre-Deployment Checklist

- [ ] ESPN API responding
- [ ] MySportsFeeds API key valid (if configured)
- [ ] Rate limiting working correctly
- [ ] Caching functioning properly
- [ ] Fallback mechanisms tested
- [ ] Error logging operational

---

_For issues with API keys, contact the development team or check the API provider documentation._
