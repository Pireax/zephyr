export abstract class BaseClient {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  protected buildUrl(endpoint: string): string {
    return new URL(`${this.baseUrl}/${endpoint}`, window.location.origin).toString()
  }

  protected async request<TResponse>(
    url: string,
    init: RequestInit,
    errorMessage: string,
  ): Promise<TResponse> {
    const response = await fetch(url, init)

    if (!response.ok) {
      throw new Error(`${errorMessage} with status ${response.status}`)
    }

    return response.json() as Promise<TResponse>
  }
}