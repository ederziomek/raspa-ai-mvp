import axios from 'axios';

// URL base da API (Railway)
const API_BASE_URL = 'https://raspa-ai-mvp-production.up.railway.app';

// Configuração do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Para enviar cookies de sessão
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.response?.data);
    
    // Tratamento de erros específicos
    if (error.response?.status === 401) {
      // Usuário não autenticado
      console.log('🔒 Usuário não autenticado');
      // Redirecionar para login se necessário
    } else if (error.response?.status === 403) {
      // Acesso negado
      console.log('🚫 Acesso negado');
    } else if (error.response?.status >= 500) {
      // Erro do servidor
      console.log('🔥 Erro do servidor');
    }
    
    return Promise.reject(error);
  }
);

export default api;

