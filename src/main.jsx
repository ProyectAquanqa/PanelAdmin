import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import AppProviders from './providers/AppProviders.jsx';

// Importar herramientas de diagnóstico en desarrollo
if (import.meta.env.DEV) {
  import('./utils/testSpecialtyConnection.js').catch(() => {
    console.log('Herramientas de diagnóstico no disponibles');
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
