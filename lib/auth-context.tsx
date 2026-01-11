"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { tokenManager } from "./auth/token-manager";

// Define User Type based on backend response
export type User = {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    [key: string]: any;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User, accessToken: string) => void;
    logout: () => void;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial Session Check
    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                // Try to refresh token immediately to check if session exists (httpOnly cookie)
                const response = await fetch('/api/auth/refresh', { method: 'POST' });
                const data = await response.json();

                if (response.ok && data.success && mounted) {
                    tokenManager.setAccessToken(data.data.accessToken);

                    // Fetch user profile if needed, or decode token.
                    // Ideally the refresh endpoint returns the user or we call /me
                    // For now, let's call the actual /me endpoint if we want full user data
                    // Or we can rely on what we have. 
                    // Let's assume we need to fetch the user.
                    // We can use the NEW access token to fetch user profile via proxy or direct.
                    // Given our api-client setup, we can't easily import it here without circular deps if it relies on context.
                    // But api-client relies on tokenManager, so it is safe.
                    // We'll dynamically import or just fetch direct.

                    await fetchUser();
                } else {
                    // No session
                    tokenManager.clearToken();
                }
            } catch (error) {
                console.error("Auth initialization failed", error);
                tokenManager.clearToken();
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        return () => {
            mounted = false;
        };
    }, []);

    const fetchUser = async () => {
        try {
            const token = tokenManager.getAccessToken();
            if (!token) return;

            // Fetch user from backend using the access token
            // We use the full URL to the backend or through a proxy if preferred.
            // Using the backend directly for /me
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setUser(data.data.user);
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
        }
    };

    const login = (userData: User, accessToken: string) => {
        setUser(userData);
        tokenManager.setAccessToken(accessToken);
    };

    const logout = async () => {
        try {
            // Call logout proxy to clear cookies
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tokenManager.getAccessToken()}`
                }
            });
        } catch (e) {
            console.error("Logout failed", e);
        } finally {
            tokenManager.clearToken();
            setUser(null);
            window.location.href = "/sign-in";
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
