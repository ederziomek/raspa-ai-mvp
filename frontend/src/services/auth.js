import api from './api.js';

export const authService = {
  // Verificar status de autenticação
  async checkAuth() {
    try {
      const response = await api.get('/api/auth/status');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Fazer login
  async login(email, password) {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Fazer registro
  async register(userData) {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Fazer logout
  async logout() {
    try {
      const response = await api.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter perfil do usuário
  async getProfile() {
    try {
      const response = await api.get('/api/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Atualizar perfil
  async updateProfile(profileData) {
    try {
      const response = await api.put('/api/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

