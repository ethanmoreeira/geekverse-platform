// A "Chave na Ignição" do Projeto
// Este é o primeiríssimo arquivo lido pelo navegador. 
// A única função dele é acordar o React, carregar os estilos básicos e ligar o componente App.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// O Bootstrap traz uma base pronta para coisas responsivas e espaçamentos
import 'bootstrap/dist/css/bootstrap.min.css'

// O CSS Reset (Neutralizador)
import './index.css'

// O "Pai de Todos" (Roteador e Layout)
import App from './App.jsx'

// Procura a div de ID "root" lá no arquivo index.html e injeta o site inteiro dentro dela
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
