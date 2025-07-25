import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await authService.checkAuth();
      
      if (response.authenticated) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      // Se há usuário na resposta, login foi bem-sucedido
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Credenciais inválidas' };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      // Se há usuário na resposta, registro foi bem-sucedido
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Erro no registro' };
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao fazer registro' 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      
      // Se há usuário na resposta, atualização foi bem-sucedida
      if (response.user) {
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Erro ao atualizar perfil' };
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao atualizar perfil' 
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

