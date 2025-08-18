import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { loginWithTrello as trelloLoginService } from '../services/trelloService';
import { loginWithJira as jiraLoginService } from '../services/jiraService';
import type { User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<boolean>;
  loginWithGoogle: (accessToken: string) => Promise<boolean>;
  loginWithTrello: (trelloToken: string) => Promise<boolean>;
  loginWithJira: (jiraCode: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sayfa yüklendiğinde kullanıcı durumunu kontrol et
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        setIsLoading(true);
        const currentUser = authService.getCurrentUser();
        const isAuth = authService.isAuthenticated();
        
        if (isAuth && currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ userEmail: email, userPassword: password });
      
      if (response.success) {
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('AuthContext login error:', error);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      // Hatayı yeniden fırlat ki component'te yakalanabilsin
      throw error;
    }
  };

  const loginWithGoogle = async (accessToken: string): Promise<boolean> => {
    try {
      const response = await authService.loginWithGoogle({ accessToken });
      
      if (response.success) {
        setUser(response.user!);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    }
  };

  const loginWithTrello = async (trelloToken: string): Promise<boolean> => {
    try {
      const response = await trelloLoginService(trelloToken);
      
      if (response.success && response.user) {
        // Backend'den gelen User objesini direkt kullan
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Trello login error:', error);
      return false;
    }
  };

  const loginWithJira = async (jiraCode: string): Promise<boolean> => {
    try {
      const response = await jiraLoginService(jiraCode);
      
      if (response.success && response.user) {
        // Backend'den gelen User objesini direkt kullan
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Jira login error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    loginWithGoogle,
    loginWithTrello,
    loginWithJira
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
