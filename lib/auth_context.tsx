"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
    id?: string;
    email?: string;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (token) {
            // Optional: decode token or call /me
            setUser({ email: "user@example.com" });
        }

        setLoading(false);
    }, []);

    const login = (user: User) => {
        setUser(user);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider
      value= {{
        user,
            isAuthenticated: !!user,
                login,
                logout,
                loading,
      }
}
    >
    { children }
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
