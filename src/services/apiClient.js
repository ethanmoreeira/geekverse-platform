// apiClient.js
// Cliente HTTP centralizado usando Axios.
// Configuração base para todas as chamadas de API.
// Interceptors de request/response para tratamento global de erros.

import axios from 'axios';

const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors serão configurados futuramente.

export default apiClient;
