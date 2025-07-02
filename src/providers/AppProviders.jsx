import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

// Configuración de QueryClient con manejo de errores y políticas de retry
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Reintenta solo una vez por defecto
      staleTime: 5 * 60 * 1000, // 5 minutos antes de considerar los datos como obsoletos
      refetchOnWindowFocus: false, // No recargar automáticamente al enfocar la ventana
      onError: (error) => {
        console.error('React Query error:', error);
      }
    },
    mutations: {
      retry: 0, // No reintentar mutaciones por defecto
      onError: (error) => {
        console.error('React Query mutation error:', error);
      }
    }
  }
});

export default function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster 
              position="top-right" 
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: 'rgba(84, 211, 106, 0.9)',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: 'rgba(239, 68, 68, 0.9)',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </BrowserRouter>
  );
} 