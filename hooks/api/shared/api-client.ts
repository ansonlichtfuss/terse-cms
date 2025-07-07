type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API Client class for making HTTP requests with repository context
 */
export class ApiClient {
  constructor(private repositoryId?: string | null) {}

  /**
   * Builds URL with optional repository parameter
   */
  private buildUrl(endpoint: string): string {
    const url = new URL(endpoint, window.location.origin);
    if (this.repositoryId) {
      url.searchParams.set('repo', this.repositoryId);
    }
    return url.toString();
  }

  /**
   * Handles API response with proper error handling
   */
  private async handleResponse<T>(response: Response, endpoint: string): Promise<T> {
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText} for ${endpoint}`);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`Invalid JSON response from ${endpoint}`);
    }
  }

  /**
   * Generic request method for all HTTP operations
   */
  async request<R>(method: HttpMethod, endpoint: string, data?: unknown): Promise<R> {
    const options: RequestInit = {
      method
    };

    if (data !== undefined) {
      options.headers = {
        'Content-Type': 'application/json'
      };
      options.body = JSON.stringify(data);
    }

    const response = await fetch(this.buildUrl(endpoint), options);
    return this.handleResponse<R>(response, endpoint);
  }

  /**
   * Get the current repository ID
   */
  getRepositoryId(): string | null | undefined {
    return this.repositoryId;
  }
}
