import React from 'react';
import { Toaster } from 'react-hot-toast';
import PropTypes from 'prop-types';

/**
 * Proveedor de notificaciones que configura react-hot-toast
 * con estilos consistentes para toda la aplicación
 * 
 * Requirement 5.3: Estilos visuales consistentes (colores, iconos, posición)
 */
const NotificationProvider = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          top: 20,
          right: 20,
        }}
        toastOptions={{
          // Configuración global por defecto
          duration: 4000,
          style: {
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '400px',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          
          // Estilos específicos por tipo
          success: {
            duration: 4000,
            style: {
              background: '#10B981',
              color: '#FFFFFF',
              border: '1px solid #059669',
            },
            iconTheme: {
              primary: '#FFFFFF',
              secondary: '#10B981',
            },
          },
          
          error: {
            duration: 6000, // Errores duran más tiempo
            style: {
              background: '#EF4444',
              color: '#FFFFFF',
              border: '1px solid #DC2626',
            },
            iconTheme: {
              primary: '#FFFFFF',
              secondary: '#EF4444',
            },
          },
          
          loading: {
            style: {
              background: '#6B7280',
              color: '#FFFFFF',
              border: '1px solid #4B5563',
            },
          },
        }}
      />
    </>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NotificationProvider;