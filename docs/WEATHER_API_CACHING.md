# Weather API Caching & Rate Limiting

The OpenWeather API has strict rate limits on the free tier:
- **60 requests per minute**
- **1,000 requests per day**

To prevent hitting these limits, aggressive caching and rate limiting has been implemented.

## Caching Strategy

### Cache Duration
- **Current Weather**: 15 minutes
- **Future Forecasts**: 60 minutes (more stable, changes less frequently)

### Cache Key Strategy
- Games are cached by `venue:rounded_hour`
- Time is rounded to the nearest hour to improve cache hit rates
- Multiple games at the same venue within an hour share the same weather data

### Cache Benefits
- **Reduces API calls by ~90%** for repeated requests
- **Improves response time** from ~500ms to ~1ms for cached data
- **Prevents rate limit violations** during high traffic

## Rate Limiting

### Request Queuing
- Minimum 1 second between API calls
- Requests are queued and processed sequentially
- Prevents burst requests from overwhelming the API

### Monitoring
- All API calls are logged with timing information
- Cache hits/misses are logged for debugging
- Cache statistics available via `getCacheStats()`

## Usage Patterns

### High Cache Hit Scenarios
✅ **Multiple users viewing recommendations for the same games**
✅ **Repeated calls within 15-60 minutes**
✅ **Games at the same venue on the same day**

### Cache Miss Scenarios
❌ **First request for a new venue/time**
❌ **Requests after cache expiration**
❌ **Games more than 5 days in the future** (returns default data)

## Monitoring & Debugging

### Console Logs
```
[OpenWeather] Cache hit for Arrowhead Stadium at 2024-12-14T20:00:00.000Z
[OpenWeather] Cache miss - fetching fresh data for Lambeau Field at 2024-12-15T13:00:00.000Z
[OpenWeather] Rate limiting: waiting 347ms before API call
[OpenWeather] Making API request to /weather?lat=44.5013&lon=-88.0622&appid=...
[OpenWeather] Cached weather for Lambeau Field (expires in 60min)
```

### Cache Statistics
```typescript
const provider = new OpenWeatherProvider(config)
const stats = provider.getCacheStats()
console.log(stats)
// { size: 5, entries: ["Arrowhead Stadium:1702684800000", ...] }
```

### Testing Cache Performance
Run the test script to verify caching is working:
```bash
npx tsx scripts/test-weather-cache.ts
```

## API Key Configuration

### Environment Variable
```bash
OPENWEATHER_API_KEY=your_api_key_here
```

### Fallback Behavior
- If no API key is provided, weather provider is disabled
- Mock weather provider is used instead
- No API calls are made

## Best Practices

### For Developers
1. **Don't clear cache unnecessarily** - it wastes API calls
2. **Use mock provider for testing** when possible
3. **Monitor console logs** for cache performance
4. **Check rate limit headers** in production

### For Production
1. **Monitor daily API usage** through OpenWeather dashboard
2. **Set up alerts** if approaching daily limits
3. **Consider upgrading plan** if consistently hitting limits
4. **Use caching at load balancer level** for additional protection

## Troubleshooting

### Rate Limit Errors
If you see 429 errors:
1. Check if caching is working properly
2. Verify cache durations are appropriate
3. Consider reducing concurrent requests
4. Monitor API usage patterns

### Cache Issues
If weather seems stale:
1. Check cache expiration times
2. Verify time zones are handled correctly
3. Clear cache for testing: `provider.clearCache()`
4. Check console logs for cache hits/misses

### Performance Issues
If weather requests are slow:
1. Verify cache hit rate is high (>80%)
2. Check for rate limiting delays
3. Monitor network latency to OpenWeather API
4. Consider using CDN or edge caching