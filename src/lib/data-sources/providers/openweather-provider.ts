import { BaseDataProvider } from '../base-provider'
import type {
  WeatherProvider,
  WeatherData,
  ApiResponse,
  ProviderConfig,
} from '../types'

interface OpenWeatherResponse {
  coord: {
    lon: number
    lat: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  wind: {
    speed: number
    deg: number
    gust?: number
  }
  clouds: {
    all: number
  }
  rain?: {
    '1h'?: number
    '3h'?: number
  }
  snow?: {
    '1h'?: number
    '3h'?: number
  }
  dt: number
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  name: string
}

interface ForecastResponse {
  list: Array<{
    dt: number
    main: {
      temp: number
      feels_like: number
      temp_min: number
      temp_max: number
      pressure: number
      humidity: number
    }
    weather: Array<{
      id: number
      main: string
      description: string
      icon: string
    }>
    wind: {
      speed: number
      deg: number
      gust?: number
    }
    pop: number // Probability of precipitation
    rain?: {
      '3h'?: number
    }
    snow?: {
      '3h'?: number
    }
  }>
  city: {
    name: string
    coord: {
      lat: number
      lon: number
    }
  }
}

/**
 * NFL stadium coordinates and dome status
 */
const NFL_VENUES = {
  'Mercedes-Benz Stadium': { lat: 33.7553, lon: -84.4006, isDome: true }, // Atlanta Falcons
  'Bank of America Stadium': { lat: 35.2258, lon: -80.8528, isDome: false }, // Carolina Panthers
  'Soldier Field': { lat: 41.8623, lon: -87.6167, isDome: false }, // Chicago Bears
  'AT&T Stadium': { lat: 32.7473, lon: -97.0945, isDome: true }, // Dallas Cowboys
  'Empower Field at Mile High': { lat: 39.7439, lon: -104.9426, isDome: false }, // Denver Broncos
  'Lambeau Field': { lat: 44.5013, lon: -88.0622, isDome: false }, // Green Bay Packers
  'NRG Stadium': { lat: 29.6847, lon: -95.4107, isDome: true }, // Houston Texans
  'Lucas Oil Stadium': { lat: 39.7601, lon: -86.1639, isDome: true }, // Indianapolis Colts
  'TIAA Bank Field': { lat: 30.3238, lon: -81.6373, isDome: false }, // Jacksonville Jaguars
  'Arrowhead Stadium': { lat: 39.0489, lon: -94.4839, isDome: false }, // Kansas City Chiefs
  'Allegiant Stadium': { lat: 36.0909, lon: -115.1833, isDome: true }, // Las Vegas Raiders
  'SoFi Stadium': { lat: 33.9535, lon: -118.3392, isDome: true }, // LA Chargers/Rams
  'Hard Rock Stadium': { lat: 25.958, lon: -80.2389, isDome: false }, // Miami Dolphins
  'U.S. Bank Stadium': { lat: 44.9738, lon: -93.2581, isDome: true }, // Minnesota Vikings
  'Gillette Stadium': { lat: 42.0909, lon: -71.2643, isDome: false }, // New England Patriots
  'Caesars Superdome': { lat: 29.9511, lon: -90.0812, isDome: true }, // New Orleans Saints
  'MetLife Stadium': { lat: 40.8135, lon: -74.0745, isDome: false }, // NY Giants/Jets
  'Lincoln Financial Field': { lat: 39.9008, lon: -75.1675, isDome: false }, // Philadelphia Eagles
  'Heinz Field': { lat: 40.4469, lon: -80.0158, isDome: false }, // Pittsburgh Steelers
  'Lumen Field': { lat: 47.5952, lon: -122.3316, isDome: false }, // Seattle Seahawks
  "Levi's Stadium": { lat: 37.4032, lon: -121.97, isDome: false }, // San Francisco 49ers
  'Raymond James Stadium': { lat: 27.9759, lon: -82.5033, isDome: false }, // Tampa Bay Buccaneers
  'Nissan Stadium': { lat: 36.1665, lon: -86.7714, isDome: false }, // Tennessee Titans
  FedExField: { lat: 38.9076, lon: -76.8645, isDome: false }, // Washington Commanders
  'State Farm Stadium': { lat: 33.5276, lon: -112.2626, isDome: true }, // Arizona Cardinals
  'M&T Bank Stadium': { lat: 39.278, lon: -76.6227, isDome: false }, // Baltimore Ravens
  'Highmark Stadium': { lat: 42.7738, lon: -78.787, isDome: false }, // Buffalo Bills
  'Paul Brown Stadium': { lat: 39.0955, lon: -84.5116, isDome: false }, // Cincinnati Bengals
  'FirstEnergy Stadium': { lat: 41.5061, lon: -81.6995, isDome: false }, // Cleveland Browns
  'Ford Field': { lat: 42.34, lon: -83.0456, isDome: true }, // Detroit Lions
} as const

/**
 * OpenWeatherMap weather provider - free tier with 1000 calls/day
 */
export class OpenWeatherProvider
  extends BaseDataProvider
  implements WeatherProvider
{
  constructor(config: Partial<ProviderConfig> = {}) {
    const defaultConfig: ProviderConfig = {
      name: 'OpenWeatherMap',
      enabled: true,
      baseUrl: 'https://api.openweathermap.org/data/2.5',
      timeout: 10000,
      retries: 2,
      rateLimitPerMinute: 60, // Conservative estimate
      ...config,
    }

    super('OpenWeatherMap', defaultConfig)

    if (!this.config.apiKey) {
      console.warn(
        'OpenWeatherMap API key not provided. Weather data will not be available.'
      )
    }
  }

  /**
   * Get weather for a specific game
   */
  async getWeatherForGame(
    gameId: string,
    venue: string,
    kickoffTime: Date
  ): Promise<ApiResponse<WeatherData>> {
    const venueInfo = this.getVenueInfo(venue)
    if (!venueInfo) {
      return {
        success: false,
        error: {
          provider: this.name,
          endpoint: '/weather',
          message: `Unknown venue: ${venue}`,
          timestamp: new Date(),
          retryable: false,
        },
      }
    }

    return this.getWeatherForVenue(
      venue,
      venueInfo.lat,
      venueInfo.lon,
      kickoffTime
    )
  }

  /**
   * Get weather for venue coordinates at specific time
   */
  async getWeatherForVenue(
    venue: string,
    lat: number,
    lon: number,
    time: Date
  ): Promise<ApiResponse<WeatherData>> {
    if (!this.config.apiKey) {
      return {
        success: false,
        error: {
          provider: this.name,
          endpoint: '/weather',
          message: 'API key not configured',
          timestamp: new Date(),
          retryable: false,
        },
      }
    }

    return this.withRetry(async () => {
      const now = new Date()
      const timeDiff = time.getTime() - now.getTime()
      const hoursFromNow = timeDiff / (1000 * 60 * 60)

      // Use current weather if game is within 1 hour
      if (Math.abs(hoursFromNow) <= 1) {
        return this.getCurrentWeather(venue, lat, lon)
      }

      // Use forecast for future games (up to 5 days)
      if (hoursFromNow > 1 && hoursFromNow <= 120) {
        return this.getForecastWeather(venue, lat, lon, time)
      }

      // For games more than 5 days out, return generic data
      return {
        success: true,
        data: this.createDefaultWeatherData(venue, lat, lon),
      }
    })
  }

  /**
   * Get current weather conditions
   */
  private async getCurrentWeather(
    venue: string,
    lat: number,
    lon: number
  ): Promise<ApiResponse<WeatherData>> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      appid: this.config.apiKey!,
      units: 'imperial', // Fahrenheit
    })

    const response = await this.makeRequest<OpenWeatherResponse>(
      `/weather?${params}`
    )

    if (!response.success || !response.data) {
      return response as ApiResponse<WeatherData>
    }

    const data = response.data
    const venueInfo = this.getVenueInfo(venue)

    return {
      success: true,
      data: {
        gameId: '', // Will be set by caller
        venue,
        lat,
        lon,
        temperature: Math.round(data.main.temp),
        windSpeed: Math.round(data.wind.speed),
        windDirection: this.getWindDirection(data.wind.deg),
        precipitationChance: this.calculatePrecipChance(data),
        humidity: data.main.humidity / 100,
        conditions: data.weather[0]?.description || 'unknown',
        isDome: venueInfo?.isDome || false,
        capturedAt: new Date(),
        source: this.name,
      },
      rateLimitRemaining: response.rateLimitRemaining,
      rateLimitReset: response.rateLimitReset,
    }
  }

  /**
   * Get forecast weather for future games
   */
  private async getForecastWeather(
    venue: string,
    lat: number,
    lon: number,
    targetTime: Date
  ): Promise<ApiResponse<WeatherData>> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      appid: this.config.apiKey!,
      units: 'imperial',
    })

    const response = await this.makeRequest<ForecastResponse>(
      `/forecast?${params}`
    )

    if (!response.success || !response.data) {
      return response as ApiResponse<WeatherData>
    }

    // Find the forecast entry closest to the target time
    const targetTimestamp = targetTime.getTime() / 1000
    let closestForecast = response.data.list[0]
    let smallestDiff = Math.abs(closestForecast.dt - targetTimestamp)

    for (const forecast of response.data.list) {
      const diff = Math.abs(forecast.dt - targetTimestamp)
      if (diff < smallestDiff) {
        smallestDiff = diff
        closestForecast = forecast
      }
    }

    const venueInfo = this.getVenueInfo(venue)

    return {
      success: true,
      data: {
        gameId: '', // Will be set by caller
        venue,
        lat,
        lon,
        temperature: Math.round(closestForecast.main.temp),
        windSpeed: Math.round(closestForecast.wind.speed),
        windDirection: this.getWindDirection(closestForecast.wind.deg),
        precipitationChance: closestForecast.pop,
        humidity: closestForecast.main.humidity / 100,
        conditions: closestForecast.weather[0]?.description || 'unknown',
        isDome: venueInfo?.isDome || false,
        capturedAt: new Date(),
        source: this.name,
      },
      rateLimitRemaining: response.rateLimitRemaining,
      rateLimitReset: response.rateLimitReset,
    }
  }

  /**
   * Create default weather data for games too far in future
   */
  private createDefaultWeatherData(
    venue: string,
    lat: number,
    lon: number
  ): WeatherData {
    const venueInfo = this.getVenueInfo(venue)

    return {
      gameId: '',
      venue,
      lat,
      lon,
      temperature: 65, // Default temperature
      windSpeed: 5, // Default wind
      windDirection: 'Variable',
      precipitationChance: 0.2, // 20% default
      humidity: 0.6, // 60% default
      conditions: 'Forecast unavailable',
      isDome: venueInfo?.isDome || false,
      capturedAt: new Date(),
      source: this.name,
    }
  }

  /**
   * Get venue information by name
   */
  private getVenueInfo(
    venue: string
  ): { lat: number; lon: number; isDome: boolean } | null {
    return NFL_VENUES[venue as keyof typeof NFL_VENUES] || null
  }

  /**
   * Convert wind degree to direction
   */
  private getWindDirection(degrees: number): string {
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ]
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  /**
   * Calculate precipitation chance from current weather
   */
  private calculatePrecipChance(data: OpenWeatherResponse): number {
    if (data.rain || data.snow) {
      return 0.8 // High chance if already precipitating
    }

    // Estimate based on weather conditions
    const condition = data.weather[0]?.main?.toLowerCase()
    switch (condition) {
      case 'rain':
      case 'drizzle':
      case 'thunderstorm':
        return 0.9
      case 'snow':
        return 0.8
      case 'clouds':
        return 0.3
      case 'clear':
        return 0.1
      default:
        return 0.2
    }
  }

  /**
   * Health check for OpenWeatherMap
   */
  async healthCheck(): Promise<boolean> {
    if (!this.config.apiKey) {
      return false
    }

    try {
      const params = new URLSearchParams({
        lat: '39.7439', // Denver coordinates for test
        lon: '-104.9426',
        appid: this.config.apiKey,
        units: 'imperial',
      })

      const response = await this.makeRequest(`/weather?${params}`)
      return response.success
    } catch {
      return false
    }
  }
}
