type TokenProvider = () => Promise<string | null>;

export class ApiClient {
  private tokenProvider?: TokenProvider
  constructor(private readonly baseUrl: string) {}

  setTokenProvider(provider: TokenProvider) {
    this.tokenProvider = provider;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, {
      method: "GET",
    });
  }

  async post<T>(
    path: string,
    body?: unknown,
  ): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(
    path: string,
    body?: unknown,
  ): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, {
      method: "DELETE",
    });
  }

  private async buildHeaders(
    initHeaders?: HeadersInit
  ): Promise<Headers> {
    const headers = new Headers(initHeaders);
    headers.set("Content-Type", "application/json");

    if(this.tokenProvider){
      const token = await this.tokenProvider()
      if(token){
        headers.set(
          'Authorization', `Bearer ${token}`
        )
      }
    }

    return headers
  }

  private async request<T>(
    path: string,
    init: RequestInit,
  ): Promise<T> {

    const headers = await this.buildHeaders(init?.headers)

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}

export const apiClient = new ApiClient("http://localhost:3001")

