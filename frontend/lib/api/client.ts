import { API_BASE_URL } from './config'

function withOptionalAuth(token?: string) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined
}

class ApiClient {
  private baseUrl: string
  private onUnauthorized?: () => void

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  setUnauthorizedHandler(handler?: () => void) {
    this.onUnauthorized = handler
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
      credentials: 'include',
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      const message = error.message || error.error || `HTTP error! status: ${response.status}`
      const apiError = new Error(message) as Error & { status?: number }
      apiError.status = response.status

      if (response.status === 401) {
        this.onUnauthorized?.()
      }

      throw apiError
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
      body: JSON.stringify({ email, password, metadata }),
    })
  }

  async signOut(token?: string) {
    return this.request('/api/auth/signout', {
      method: 'POST',
      headers: withOptionalAuth(token),
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

  async updateTenderStatus(id: string, status: string) {
    return this.request(`/api/tenders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
    })
  }

  async getTenderSources() {
    return this.request('/api/tender-sources')
  }

  async createTenderSource(source: { name: string; base_url: string; type: string }) {
    return this.request('/api/tender-sources', {
      method: 'POST',
      body: JSON.stringify({ ...source, is_active: true }),
    })
  }

  async updateTenderSource(id: string, updates: Record<string, any>) {
    return this.request(`/api/tender-sources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteTenderSource(id: string) {
    return this.request(`/api/tender-sources/${id}`, {
      method: 'DELETE',
    })
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

  async updateApplicationStatus(id: string, status: string) {
    const updates: Record<string, string> = { status }

    if (status === 'submitted') {
      updates.submitted_at = new Date().toISOString()
    }

    return this.request(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteApplication(id: string) {
    return this.request(`/api/applications/${id}`, {
      method: 'DELETE',
    })
  }

  async createDraftApplication(tenderId: string) {
    return this.request('/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        tender_id: tenderId,
        status: 'draft',
        notes: '',
        documents: [],
      }),
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

  async getCurrentUser(token?: string) {
    return this.request('/api/auth/user', {
      headers: withOptionalAuth(token),
    })
  }

  async scrapeTenderSource(sourceUrl: string, sourceId: string) {
    return this.request('/api/scrape-tenders', {
      method: 'POST',
      body: JSON.stringify({ sourceUrl, sourceId }),
    })
  }

  // Health check
  async healthCheck() {
    return this.request('/health')
  }
}

export const apiClient = new ApiClient()
export default apiClient
