const API_BASE_URL = 'http://localhost:8000';

export interface ChatMessage {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  sources: Array<{
    content: string;
    source: string;
    score: number;
  }>;
}

export interface DocumentInfo {
  filename: string;
  upload_date: string;
  status: string;
  chunks_count?: number;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async sendMessage(message: string, conversationId?: string): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      }),
    });
  }

  async uploadDocuments(files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}/upload-documents`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getDocuments(): Promise<{ documents: DocumentInfo[] }> {
    return this.request<{ documents: DocumentInfo[] }>('/documents');
  }

  async getConversation(conversationId: string): Promise<any> {
    return this.request(`/conversations/${conversationId}`);
  }

  async generateReport(conversationId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/generate-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: '',
        conversation_id: conversationId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    return response.blob();
  }

  async deleteDocument(fileId: string): Promise<void> {
    await this.request(`/documents/${fileId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();