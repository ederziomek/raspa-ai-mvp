import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, register as registerService, logout as logoutService, isAuthenticated, getCurrentUser, getCurrentTenant } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = () => {
      try {
        if (isAuthenticated()) {
          const userData = getCurrentUser();
          const tenantData = getCurrentTenant();
          setUser(userData);
          setTenant(tenantData);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await loginService(email, password);
      
      if (response.user && response.token) {
        setUser(response.user);
        setTenant(response.tenant);
        return { success: true, message: response.message };
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      const errorMessage = error.message || error.error || 'Erro ao fazer login';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await registerService(email, password, name);
      
      if (response.user && response.token) {
        setUser(response.user);
        setTenant(response.tenant);
        return { success: true, message: response.message };
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      const errorMessage = error.message || error.error || 'Erro ao registrar';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setTenant(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      // Implementar atualização de perfil se necessário
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || error.error || 'Erro ao atualizar perfil';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    tenant,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

