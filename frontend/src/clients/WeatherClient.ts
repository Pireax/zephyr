import { BaseClient } from './BaseClient.ts'

export class WeatherClient extends BaseClient {
  private readonly weatherUrl: string

  constructor(baseUrl?: string) {
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
