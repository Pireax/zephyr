const defaultBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '') + '/api'

export class WeatherClient {
  private readonly weatherUrl: string

  constructor(baseUrl = defaultBaseUrl) {
    this.weatherUrl = `${baseUrl.replace(/\/$/, '')}/weather`
  }

  getWeather<TResponse = unknown>(
    signal?: AbortSignal,
  ): Promise<TResponse> {
    const url = new URL(this.weatherUrl, window.location.origin)
    return this.request<TResponse>(url.toString(), { method: 'GET', signal })
  }

  private async request<TResponse>(
    url: string,
    init: RequestInit,
  ): Promise<TResponse> {
    const response = await fetch(url, init)

    if (!response.ok) {
      throw new Error(`Weather request failed with status ${response.status}`)
    }

    return response.json() as Promise<TResponse>
  }
}
