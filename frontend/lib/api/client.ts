const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function withOptionalAuth(token?: string) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    // Handle empty responses
    const text = await response.text()
    if (!text) {
      return {} as T
    }
    
    try {
      return JSON.parse(text)
    } catch (parseError) {
      throw new Error('Invalid JSON response from server')
    }
  }

  // Auth endpoints
  async signIn(email: string, password: string) {
    return this.request('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async signUp(email: string, password: string, metadata: any) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...metadata }),
    })
  }

  async signOut(token: string) {
    return this.request('/api/auth/signout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  // Tender endpoints
  async getTenders(params?: any) {
    const searchParams = new URLSearchParams(params)
    return this.request(`/api/tenders?${searchParams}`)
  }

  async getTender(id: string) {
    return this.request(`/api/tenders/${id}`)
  }

  async createTender(tenderData: any, token: string) {
    return this.request('/api/tenders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tenderData),
    })
  }

  async updateTender(id: string, tenderData: any, token: string) {
    return this.request(`/api/tenders/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tenderData),
    })
  }

  async deleteTender(id: string, token: string) {
    return this.request(`/api/tenders/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async getTenderSources() {
    return this.request('/api/tender-sources')
  }

  // Application endpoints
  async getApplications(token?: string) {
    return this.request('/api/applications', {
      headers: withOptionalAuth(token),
    })
  }

  async createApplication(applicationData: any, token: string) {
    return this.request('/api/applications', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(applicationData),
    })
  }

  async updateApplication(id: string, applicationData: any, token: string) {
    return this.request(`/api/applications/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(applicationData),
    })
  }

  // Scraping endpoints
  async scrapeTender(url: string, token: string) {
    return this.request('/api/scrape-tenders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    })
  }

  async getScrapingStatus(jobId: string, token: string) {
    return this.request(`/api/scrape-tenders/status/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  // Email endpoints
  async sendEmailAlert(data: any, token: string) {
    return this.request('/api/email/send-alert', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  }

  // Password reset endpoints
  async resetPassword(email: string) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async updatePassword(newPassword: string, token: string) {
    return this.request('/api/auth/update-password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    })
  }

  async getCurrentUser(token: string) {
    return this.request('/api/auth/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  // Health check
  async healthCheck() {
    return this.request('/health')
  }
}

export const apiClient = new ApiClient()
export default apiClient
