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

      if (msalInstance && msalAccount) {
        try {
          // Try to refresh MSAL token silently
          const tokenResponse = await msalInstance.acquireTokenSilent({
            scopes: [
              "User.Read",
              "https://analysis.windows.net/powerbi/api/Tenant.Read.All",
            ],
            account: msalAccount,
            forceRefresh: true,
          });

          if (tokenResponse.idToken) {
            // Exchange new MSAL token for backend token
            await authService.getBackendToken(tokenResponse.idToken);

            // Retry the original request with new token
            const newToken = authService.getStoredToken();
            if (newToken) {
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
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }

      // If refresh failed or not possible, clear tokens and redirect to login
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
