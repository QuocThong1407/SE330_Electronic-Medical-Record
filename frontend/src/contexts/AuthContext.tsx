import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { login as loginRequest, me as meRequest } from "@/services/authService";
import { storage } from "@/lib/storage";
import type { UserSummary } from "@/types/auth";

interface AuthContextValue {
  user: UserSummary | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(storage.getToken());
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        await refreshMeInternal();
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, [token]);

  const refreshMeInternal = async () => {
    const current = await meRequest();
    setUser(current);
  };

  const login = async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    storage.setToken(response.accessToken);
    setToken(response.accessToken);
    setUser(response.user);
  };

  const logout = () => {
    storage.clearToken();
    setToken(null);
    setUser(null);
  };

  const refreshMe = async () => {
    await refreshMeInternal();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
