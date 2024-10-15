import { createContext, useState, ReactNode, useEffect } from 'react';
import axiosInstance from '../AxiosInstance';

interface AuthContextProps {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  login: async () => { },
  register: async () => { },
  logout: () => { },
  token: null,
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load token from localStorage if available
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await axiosInstance.post('http://localhost:3001/auth/login', {
        username,
        password,
      });
      const accessToken = response.data.access_token;
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      await axiosInstance.post('http://localhost:3001/auth/register', {
        username,
        password,
      });
      // Optionally, log the user in immediately after registration
      await login(username, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, register, logout, token }}
    >
      {children}
    </AuthContext.Provider>
  );
};
