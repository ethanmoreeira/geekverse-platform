
// Configuração central para baixar dados usando a biblioteca Axios.
// Aqui eu defino um limite: se a API demorar mais de 10 segundos, ele desiste (timeout) para não travar o jogo eternamente.

import axios from 'axios';

const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


export default apiClient;
