import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthUser, LoginRequest, SignupRequest } from "../types";
import * as authApi from "../api/auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<{ display_name: string; bio: string; avatar_url: string }>) => Promise<AuthUser>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUser(null);
        return;
      }
      const currentUser = await authApi.getMe();
      setUser(currentUser);
      localStorage.setItem("user", JSON.stringify(currentUser));
    } catch {
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }
        await refreshUser();
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [refreshUser]);

  const login = useCallback(async (data: LoginRequest) => {
    const currentUser = await authApi.login(data);
    setUser(currentUser);
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    const currentUser = await authApi.signup(data);
    setUser(currentUser);
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<{ display_name: string; bio: string; avatar_url: string }>) => {
    const updatedUser = await authApi.updateProfile(data);
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
