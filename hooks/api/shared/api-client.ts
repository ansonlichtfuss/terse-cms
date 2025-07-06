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
    } catch (error) {
      throw new Error(`Invalid JSON response from ${endpoint}`);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(this.buildUrl(endpoint));
    return this.handleResponse<T>(response, endpoint);
  }

  /**
   * POST request
   */
  async post<T, R = void>(endpoint: string, data: T): Promise<R> {
    const response = await fetch(this.buildUrl(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return this.handleResponse<R>(response, endpoint);
  }

  /**
   * DELETE request
   */
  async delete<T, R = void>(endpoint: string, data: T): Promise<R> {
    const response = await fetch(this.buildUrl(endpoint), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return this.handleResponse<R>(response, endpoint);
  }

  /**
   * PUT request
   */
  async put<T, R = void>(endpoint: string, data: T): Promise<R> {
    const response = await fetch(this.buildUrl(endpoint), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return this.handleResponse<R>(response, endpoint);
  }

  /**
   * PATCH request
   */
  async patch<T, R = void>(endpoint: string, data: T): Promise<R> {
    const response = await fetch(this.buildUrl(endpoint), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return this.handleResponse<R>(response, endpoint);
  }

  /**
   * Create a new ApiClient instance with a different repository ID
   */
  withRepository(repositoryId: string | null): ApiClient {
    return new ApiClient(repositoryId);
  }

  /**
   * Get the current repository ID
   */
  getRepositoryId(): string | null | undefined {
    return this.repositoryId;
  }
}