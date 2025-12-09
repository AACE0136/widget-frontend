const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4567";

interface TokenResponse {
  access_token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export const authService = {
  async getBackendToken(msalIdToken: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/sso/check-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken: msalIdToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get backend token: ${response.statusText}`);
      }

      const data: TokenResponse = await response.json();

      // Store token in localStorage
      localStorage.setItem("backend_token", data.access_token);
      if (data.refreshToken) {
        localStorage.setItem("backend_refresh_token", data.refreshToken);
      }
      if (data.expiresIn) {
        const expiryTime = Date.now() + data.expiresIn * 1000;
        localStorage.setItem("backend_token_expiry", expiryTime.toString());
      }

      return data.access_token;
    } catch (error) {
      console.error("Error getting backend token:", error);
      throw error;
    }
  },

  getStoredToken(): string | null {
    return localStorage.getItem("backend_token");
  },

  isTokenValid(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    const expiry = localStorage.getItem("backend_token_expiry");
    if (expiry) {
      return Date.now() < parseInt(expiry);
    }

    return true;
  },

  clearTokens(): void {
    localStorage.removeItem("backend_token");
    localStorage.removeItem("backend_refresh_token");
    localStorage.removeItem("backend_token_expiry");

    // Clear all MSAL related items from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("msal.") || key.includes("msal")) {
        localStorage.removeItem(key);
      }
    });
  },
};
