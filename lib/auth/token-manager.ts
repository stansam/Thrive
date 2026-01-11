/**
 * Token Manager
 * 
 * Manages the in-memory access token.
 * This singleton ensures we have a central place to store and retrieve the short-lived access token.
 * It does NOT persist the token to localStorage.
 */

class TokenManager {
    private accessToken: string | null = null;
    private listeners: ((token: string | null) => void)[] = [];

    getAccessToken(): string | null {
        return this.accessToken;
    }

    setAccessToken(token: string | null) {
        this.accessToken = token;
        this.notifyListeners();
    }

    clearToken() {
        this.accessToken = null;
        this.notifyListeners();
    }

    // Allow AuthContext to subscribe to changes if needed (optional but good for syncing)
    subscribe(listener: (token: string | null) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.accessToken));
    }
}

export const tokenManager = new TokenManager();
