/**
 * Configuración de Vite para PanelAdmin
 * 
 * Este archivo configura el entorno de desarrollo y construcción
 * para la aplicación React del panel administrativo de AquanQ
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    /**
     * Configuración del proxy para redirigir llamadas a la API
     * hacia el servidor backend de Django en desarrollo
     */
    proxy: {
      '/api': {
        target: 'http://192.168.18.13:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Error del proxy:', err.message);
          });
        },
      }
    },
    
    /** Puerto del servidor de desarrollo */
    port: 5173,
    
    /** Habilitar CORS para desarrollo */
    cors: true
  }
})
