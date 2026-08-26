import { BaseClient } from './BaseClient.ts'

const defaultBaseUrl = (import.meta.env.VITE_WEATHER_API_BASE_URL ?? '') + '/api'

export class WeatherClient extends BaseClient {
  private readonly weatherUrl: string

  constructor(baseUrl = defaultBaseUrl) {
    super(baseUrl)
    this.weatherUrl = this.buildUrl('weather')
  }

  getWeather<TResponse = unknown>(
    signal?: AbortSignal,
  ): Promise<TResponse> {
    return this.request<TResponse>(
      this.weatherUrl,
      { method: 'GET', signal },
      'Weather request failed',
    )
  }
}
