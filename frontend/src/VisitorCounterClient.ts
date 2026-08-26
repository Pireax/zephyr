const defaultBaseUrl = 'http://localhost:7160/api'

export class VisitorCounterClient {
  private readonly visitorsUrl: string

  constructor(baseUrl = defaultBaseUrl) {
    this.visitorsUrl = `${baseUrl.replace(/\/$/, '')}/Visitors`
  }

  getVisitors<TResponse = unknown>(signal?: AbortSignal): Promise<TResponse> {
    return this.request<TResponse>({ method: 'GET', signal })
  }

  postVisitors<TResponse = unknown>(
    signal?: AbortSignal,
  ): Promise<TResponse> {
    return this.request<TResponse>({
      method: 'POST',
      signal,
    })
  }

  private async request<TResponse>(init: RequestInit): Promise<TResponse> {
    const response = await fetch(this.visitorsUrl, init)

    if (!response.ok) {
      throw new Error(`Visitor counter request failed with status ${response.status}`)
    }

    return response.json() as Promise<TResponse>
  }
}