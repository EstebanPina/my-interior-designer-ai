import { useState, useCallback } from 'react';
import { designAPI, authAPI, handleAPICall, DesignRequest, DesignResponse, AuthResponse, User } from '@/lib/api-client';

// Hook para autenticación
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    const { data, error } = await handleAPICall(() =>
      authAPI.login({ email, password })
    );

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return false;
    }

    if (data) {
      setUser(data.user);
      // Guardar token en localStorage
      localStorage.setItem('token', data.token);
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);

    const { data, error } = await handleAPICall(() =>
      authAPI.register({ email, password, name })
    );

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return false;
    }

    if (data) {
      setUser(data.user);
      localStorage.setItem('token', data.token);
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}

// Hook para diseño
export function useDesign() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<DesignResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const generateDesign = useCallback(async (request: DesignRequest) => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setProgress(0);

    // Simular progreso
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    const { data, error } = await handleAPICall(() =>
      designAPI.generateDesign(request)
    );

    clearInterval(progressInterval);
    setProgress(100);

    if (error) {
      setError(error.message);
      setIsGenerating(false);
      return null;
    }

    if (data) {
      setResult(data);
      setIsGenerating(false);
      return data;
    }

    setIsGenerating(false);
    return null;
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    isGenerating,
    result,
    error,
    progress,
    generateDesign,
    reset,
  };
}

// Hook para estilos de diseño
export function useDesignStyles() {
  const [styles, setStyles] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStyles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error } = await handleAPICall(() =>
      designAPI.getStyles()
    );

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    if (data) {
      setStyles(data.styles);
      setDescriptions(data.descriptions);
      setIsLoading(false);
    }
  }, []);

  return {
    styles,
    descriptions,
    isLoading,
    error,
    loadStyles,
  };
}