# News Analysis Configuration and Usage

## Overview

The news analysis service provides LLM-powered tie-breaking for close games by analyzing recent news, injury reports, and team factors. It integrates with multiple LLM providers and displays results via hover badges in the GameProjection component.

## Configuration

### Environment Variables

Configure your preferred LLM provider and news analysis settings:

```bash
# OpenAI (default)
OPENAI_API_KEY=your_openai_key

# DeepSeek
DEEPSEEK_API_KEY=your_deepseek_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key

# Custom provider
CUSTOM_LLM_API_KEY=your_custom_key

# News API (required for all providers)
NEWS_API_KEY=your_news_api_key

# Mock Data & Configuration (New!)
USE_MOCK_NEWS_DATA="true"  # Use mock data instead of real API calls
NEWS_ANALYSIS_MIN_RANGE="0"  # Games 50% confidence and up
NEWS_ANALYSIS_MAX_RANGE="15"  # Games up to 35-65% confidence range
```

### Service Configuration

```typescript
import { NewsAnalysisService } from '@/lib/models/news-analysis'

// Default configuration (OpenAI)
const service = new NewsAnalysisService()

// DeepSeek configuration
const deepSeekService = new NewsAnalysisService({
  llmProvider: 'deepseek',
  model: 'deepseek-chat',
  maxTokens: 1000,
  temperature: 0.3,
})

// Anthropic configuration
const claudeService = new NewsAnalysisService({
  llmProvider: 'anthropic',
  model: 'claude-3-haiku-20240307',
  maxTokens: 1000,
  temperature: 0.3,
})

// Custom provider configuration
const customService = new NewsAnalysisService({
  llmProvider: 'custom',
  apiEndpoint: 'https://your-custom-api.com/v1/chat/completions',
  model: 'your-model',
  apiKey: 'your-key',
  maxTokens: 1000,
  temperature: 0.3,
})
```

## How It Works

1. **Trigger Condition**: Only activates for close games (confidence difference ≤ 10%)
2. **News Fetching**: Retrieves recent team news from News API (3 days prior to game)
3. **LLM Analysis**: Analyzes news headlines for key factors that could impact game outcome
4. **Factor Extraction**: Identifies injury reports, suspensions, trades, morale issues, etc.
5. **Recommendation**: Provides slight edge to one team if factors are significant enough
6. **UI Display**: Shows hover badge when news analysis is active

## UI Integration

The GameProjection component automatically displays a news analysis badge when the service returns results:

- **Blue badge**: News analysis favors home team
- **Green badge**: News analysis favors away team
- **Gray badge**: News analysis found factors but no clear recommendation
- **Hover tooltip**: Shows analysis summary and confidence level

## Factor Types

The service identifies these types of news factors:

- `INJURY_REPORT`: Player injuries or returns
- `SUSPENSION`: Disciplinary actions
- `TEAM_MORALE`: Team chemistry issues
- `COACHING_CHANGE`: Coaching staff changes
- `TRADE_IMPACT`: Recent trades or roster moves
- `WEATHER_CONCERN`: Weather-related advantages
- `TRAVEL_FATIGUE`: Travel or scheduling factors
- `ROSTER_DEPTH`: Depth chart changes
- `RECENT_PERFORMANCE`: Form-related factors
- `PLAYOFF_IMPLICATIONS`: Playoff race impacts

## Impact Scaling

- Impact range: -5 (strongly favors away) to +5 (strongly favors home)
- Confidence range: 0-1 (how certain the analysis is)
- Recommendation threshold: ±1.0 impact required for team recommendation
- Maximum analysis confidence: 80%

## Integration with Confidence Engine

The news analysis service integrates seamlessly with the confidence engine as a tie-breaking factor. It only activates when:

1. The raw confidence is between 40-60% (close games)
2. News API and LLM API keys are configured
3. Relevant news articles are found for either team
4. LLM successfully identifies significant factors

The analysis result is stored in the `newsAnalysis` field of the game factors and displayed in the UI via the hover badge system.
