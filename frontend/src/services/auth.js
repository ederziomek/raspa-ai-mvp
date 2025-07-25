import api from './api';

// Login com JWT
export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth-jwt/login', {
      email,
      password
    });
    
    // Salvar token e dados no localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('tenant', JSON.stringify(response.data.tenant));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Erro na comunicação com servidor' };
  }
};

// Registro com JWT
export const register = async (email, password, name) => {
  try {
    const response = await api.post('/api/auth-jwt/register', {
      email,
      password,
      name
    });
    
    // Salvar token e dados no localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('tenant', JSON.stringify(response.data.tenant));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Erro na comunicação com servidor' };
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('tenant');
};

// Verificar se está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Obter usuário atual
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Obter tenant atual
export const getCurrentTenant = () => {
  const tenant = localStorage.getItem('tenant');
  return tenant ? JSON.parse(tenant) : null;
};

// Obter token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Verificar status de autenticação no servidor
export const checkAuthStatus = async () => {
  try {
    const response = await api.get('/api/auth-jwt/status');
    return response.data;
  } catch (error) {
    return { authenticated: false };
  }
};

