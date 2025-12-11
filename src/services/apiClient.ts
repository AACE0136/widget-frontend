import { authService } from "../services/authService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4567";

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

// Store MSAL instance reference (will be set from App.tsx)
let msalInstance: any = null;
let msalAccount: any = null;

export const setMsalContext = (instance: any, account: any) => {
  msalInstance = instance;
  msalAccount = account;
};

export const apiClient = {
  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem("backend_refresh_token");
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Refresh token request failed");
      }

      const data = await response.json();
      console.log("REFRESH RESPONSE:", data);

      // Store new tokens
      if (data.access_token) {
        localStorage.setItem("backend_token", data.access_token);
      }
      if (data.refresh_token) {
        console.log("BACKEND REFRESH TOKEN:", data.refresh_token);
        localStorage.setItem("backend_refresh_token", data.refresh_token);
      }
      if (data.expiresIn) {
        const expiryTime = Date.now() + data.expiresIn * 3000;
        localStorage.setItem("backend_token_expiry", expiryTime.toString());
      }

      return data.access_token;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    }
  },

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
      // Token expired or invalid - try to refresh
      console.log("401 error - attempting token refresh...");

      // First, try to refresh using backend refresh token
      const newToken = await this.refreshToken();

      if (newToken) {
        console.log("Token refreshed successfully using refresh token");
        // Retry the original request with new token
        (headers as Record<string, string>)[
          "Authorization"
        ] = `Bearer ${newToken}`;
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });

        if (retryResponse.ok) {
          console.log("Request successful after token refresh");
          return retryResponse;
        }
      }

      // If refresh failed, clear tokens and redirect to login
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
