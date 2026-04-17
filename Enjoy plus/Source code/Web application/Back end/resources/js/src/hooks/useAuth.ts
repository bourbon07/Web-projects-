import { useState, useCallback, useEffect } from "react";
import { authService } from "../api/auth";
import { useApp } from "../app/context/AppContext";
import { User, Gender } from "../types";

export function useAuth() {
  const { setCurrentUser, setIsLoggedIn } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(credentials);
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCurrentUser, setIsLoggedIn]);

  const register = useCallback(async (formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(formData);
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCurrentUser, setIsLoggedIn]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setCurrentUser(null);
      setIsLoggedIn(false);
    }
  }, [setCurrentUser, setIsLoggedIn]);

  const checkAuth = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
      setIsLoggedIn(true);
    } catch {
      setCurrentUser(null);
      setIsLoggedIn(false);
    }
  }, [setCurrentUser, setIsLoggedIn]);

  return { login, register, logout, checkAuth, loading, error };
}
