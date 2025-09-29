// ==========================================
// src/main.jsx
// ==========================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeApi } from './services/api';

// Inicializar configuração da API
initializeApi();

// Renderizar aplicação
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);