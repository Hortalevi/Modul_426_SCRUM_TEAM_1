import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:5201/api/Auth/Check", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUsername(data.username);
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUsername(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (usernameInput: string, password: string) => {
    const response = await fetch("http://localhost:5201/api/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ usernameOrEmail: usernameInput, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Login fehlgeschlagen");
    }

    const data = await response.json();
    setIsAuthenticated(true);
    setUsername(data.username);
  };

  const logout = async () => {
    await fetch("http://localhost:5201/api/Logout", {
      method: "POST",
      credentials: "include",
    });

    setIsAuthenticated(false);
    setUsername(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, username, loading, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth muss innerhalb von AuthProvider verwendet werden");
  }
  return context;
}
