"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

const ADMIN_PASSWORD = "admin123"; // Hardcoded password for now
const AUTH_KEY = "admin_authenticated";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>(
    AUTH_KEY,
    false
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated: isMounted ? isAuthenticated : false,
    login,
    logout,
    isMounted,
  };
}

