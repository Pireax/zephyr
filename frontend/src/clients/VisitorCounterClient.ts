import { BaseClient } from './BaseClient.ts'

const defaultBaseUrl = (import.meta.env.VITE_VISITORS_API_BASE_URL ?? '') + '/api'

export class VisitorCounterClient extends BaseClient {
  private readonly visitorsUrl: string

  constructor(baseUrl = defaultBaseUrl) {
    super(baseUrl)
    this.visitorsUrl = this.buildUrl('Visitors')
  }

  getVisitors<TResponse = unknown>(signal?: AbortSignal): Promise<TResponse> {
    return this.request<TResponse>(
      this.visitorsUrl,
      { method: 'GET', signal },
      'Visitor counter request failed',
    )
  }

  postVisitors<TResponse = unknown>(
    signal?: AbortSignal,
  ): Promise<TResponse> {
    return this.request<TResponse>(
      this.visitorsUrl,
      { method: 'POST', signal },
      'Visitor counter request failed',
    )
  }
}