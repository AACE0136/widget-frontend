import { authService } from "../services/authService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4567";

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

export const apiClient = {
  async fetch(endpoint: string, options: FetchOptions = {}) {
    const token = authService.getStoredToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid
      authService.clearTokens();
      window.location.href = "/";
      throw new Error("Authentication expired. Please login again.");
    }

    return response;
  },

  async get(endpoint: string) {
    const response = await this.fetch(endpoint, { method: "GET" });
    return response.json();
  },

  async post(endpoint: string, data?: any) {
    const response = await this.fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async put(endpoint: string, data?: any) {
    const response = await this.fetch(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async delete(endpoint: string) {
    const response = await this.fetch(endpoint, { method: "DELETE" });
    return response.json();
  },
};
