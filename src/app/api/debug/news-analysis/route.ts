import { NextResponse } from 'next/server'
import { NewsAnalysisService } from '@/lib/models/news-analysis'

export async function GET() {
  try {
    // Test the news analysis service with mock data
    const service = new NewsAnalysisService()

    const testInput = {
      gameId: 'test-game-1',
      homeTeamId: 'test-home',
      awayTeamId: 'test-away',
      homeTeamName: 'Kansas City Chiefs',
      awayTeamName: 'Buffalo Bills',
      kickoffTime: new Date(),
      venue: 'Arrowhead Stadium',
      confidenceDifference: 5, // 45-55% confidence range
      currentHomeConfidence: 55,
      currentAwayConfidence: 45,
    }

    console.log('[Debug] Testing news analysis service...')
    const result = await service.analyzeGame(testInput)

    console.log('[Debug] News analysis result:', {
      analysisConfidence: result.analysisConfidence,
      recommendedTeam: result.recommendedTeam,
      keyFactors: result.keyFactors?.length,
      summary: result.summary,
      sources: result.sources?.length,
    })

    return NextResponse.json({
      success: true,
      config: {
        useMockData: process.env.USE_MOCK_NEWS_DATA,
        newsApiKey: !!process.env.NEWS_API_KEY,
        minRange: process.env.NEWS_ANALYSIS_MIN_RANGE,
        maxRange: process.env.NEWS_ANALYSIS_MAX_RANGE,
      },
      result,
    })
  } catch (error) {
    console.error('[Debug] News analysis test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        useMockData: process.env.USE_MOCK_NEWS_DATA,
        newsApiKey: !!process.env.NEWS_API_KEY,
        minRange: process.env.NEWS_ANALYSIS_MIN_RANGE,
        maxRange: process.env.NEWS_ANALYSIS_MAX_RANGE,
      },
    })
  }
}
