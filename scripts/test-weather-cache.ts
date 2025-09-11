#!/usr/bin/env tsx

/**
 * Test script to verify weather caching is working
 */

import { OpenWeatherProvider } from '../src/lib/data-sources/providers/openweather-provider'

async function testWeatherCache() {
  console.log('Testing OpenWeather API Caching\n')
  console.log('=' .repeat(50))
  
  const provider = new OpenWeatherProvider({
    apiKey: process.env.OPENWEATHER_API_KEY
  })
  
  if (!process.env.OPENWEATHER_API_KEY) {
    console.log('❌ OPENWEATHER_API_KEY not set - using mock behavior')
    return
  }
  
  const gameId = 'test-game'
  const venue = 'Arrowhead Stadium' // Known venue
  const kickoffTime = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
  
  console.log(`Testing weather for: ${venue}`)
  console.log(`Kickoff time: ${kickoffTime.toISOString()}`)
  console.log(`Game ID: ${gameId}\n`)
  
  // First request - should hit API
  console.log('🔥 First request (should fetch from API):')
  const start1 = Date.now()
  const result1 = await provider.getWeatherForGame(gameId, venue, kickoffTime)
  const duration1 = Date.now() - start1
  
  if (result1.success) {
    console.log(`✅ Success! Temperature: ${result1.data.temperature}°F, Wind: ${result1.data.windSpeed}mph`)
    console.log(`⏱️  Duration: ${duration1}ms`)
  } else {
    console.log(`❌ Failed: ${result1.error?.message}`)
  }
  
  // Check cache stats
  const stats1 = provider.getCacheStats()
  console.log(`📊 Cache stats: ${stats1.size} entries`)
  
  console.log('\n' + '-'.repeat(50))
  
  // Second request - should hit cache
  console.log('⚡ Second request (should use cache):')
  const start2 = Date.now()
  const result2 = await provider.getWeatherForGame(gameId, venue, kickoffTime)
  const duration2 = Date.now() - start2
  
  if (result2.success) {
    console.log(`✅ Success! Temperature: ${result2.data.temperature}°F, Wind: ${result2.data.windSpeed}mph`)
    console.log(`⚡ Duration: ${duration2}ms (should be much faster!)`)
  } else {
    console.log(`❌ Failed: ${result2.error?.message}`)
  }
  
  // Verify data matches
  if (result1.success && result2.success) {
    const temp1 = result1.data.temperature
    const temp2 = result2.data.temperature
    
    if (temp1 === temp2) {
      console.log(`✅ Cache working! Both requests returned ${temp1}°F`)
    } else {
      console.log(`❌ Cache problem! First: ${temp1}°F, Second: ${temp2}°F`)
    }
  }
  
  // Performance comparison
  const speedup = duration1 / duration2
  console.log(`🚀 Cache speedup: ${speedup.toFixed(1)}x faster`)
  
  // Check cache stats again
  const stats2 = provider.getCacheStats()
  console.log(`📊 Cache stats: ${stats2.size} entries`)
  console.log(`🗂️  Cache keys: ${stats2.entries.join(', ')}`)
  
  console.log('\n' + '='.repeat(50))
  console.log('Test Complete!')
  
  if (speedup > 5) {
    console.log('✅ PASS: Cache is working effectively')
  } else {
    console.log('⚠️  WARNING: Cache may not be working as expected')
  }
}

// Run the test
testWeatherCache().catch(console.error)