import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { loginWithTrello as trelloLoginService } from '../services/trelloService';
import { loginWithJira as jiraLoginService } from '../services/jiraService';
import type { User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin?: boolean;
  hasRole?: (role: string) => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
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
    console.log('🔐 [AUTH CONTEXT] Login başlatılıyor:', { email });
    
    // Önce standart login'i dene; başarısız olursa admin-login fallback uygula
    try {
      console.log('🔐 [AUTH CONTEXT] Standart login deneniyor...');
      const response = await authService.login({ userEmail: email, userPassword: password });
      console.log('🔐 [AUTH CONTEXT] Standart login response:', { 
        success: response.success, 
        hasUser: !!response.user,
        hasAdmin: !!response.admin 
      });
      
      if (response.success && response.user) {
        console.log('🔐 [AUTH CONTEXT] Standart login başarılı, user set ediliyor');
        setUser(response.user);
        return true;
      }
    } catch (error) {
      console.warn('🔐 [AUTH CONTEXT] Standart login başarısız, admin fallback denenecek.', error);
    }

    // Admin fallback
    try {
      console.log('🔐 [AUTH CONTEXT] Admin fallback deneniyor...');
      const adminResp = await authService.adminLogin({ adminEmail: email, adminPassword: password });
      console.log('🔐 [AUTH CONTEXT] Admin fallback response:', { 
        success: adminResp.success, 
        hasUser: !!adminResp.user,
        hasAdmin: !!adminResp.admin 
      });
      
      const userData = adminResp.admin || adminResp.user;
      if (adminResp.success && userData) {
        console.log('🔐 [AUTH CONTEXT] Admin fallback başarılı, user set ediliyor');
        setUser(userData);
        return true;
      }
    } catch (adminErr) {
      console.error('🔐 [AUTH CONTEXT] Admin login fallback da başarısız oldu.', adminErr);
    }

    console.log('🔐 [AUTH CONTEXT] Tüm login denemeleri başarısız');
    return false;
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.adminLogin({ adminEmail: email, adminPassword: password });
      
      if (response.success) {
        const userData = response.admin || response.user;
        if (userData) {
          setUser(userData);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('AuthContext admin login error:', error);
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
      
      if (response.success && response.user) {
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
    isAdmin: (user?.roles || []).some(r => r.toLowerCase() === 'admin' || r.toLowerCase() === 'administrator'),
    hasRole: (role: string) => (user?.roles || []).some(r => r.toLowerCase() === role.toLowerCase()),
    login,
    adminLogin,
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
