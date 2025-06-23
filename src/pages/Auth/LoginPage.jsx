import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const loginSchema = z.object({
  email: z.string().email({ message: "Ingrese un email válido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: process.env.NODE_ENV === 'development' ? 'admin@hospital.pe' : '',
      password: process.env.NODE_ENV === 'development' ? 'admin123' : ''
    }
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setDiagnosticInfo(null);
    
    try {
      console.log('🔑 Intentando login con:', data.email);
      const response = await login(data);
      console.log('✅ Login exitoso:', response);
      toast.success('Inicio de sesión exitoso');
      navigate('/');
    } catch (err) {
      console.error("Error completo:", err);
      
      // Mostrar mensaje de error detallado
      let errorMessage = "Error al iniciar sesión. Por favor, inténtelo de nuevo.";
      let diagnosticData = null;
      
      if (err.response) {
        // El servidor respondió con un código de error
        console.log("Datos de respuesta:", err.response.data);
        diagnosticData = {
          status: err.response.status,
          statusText: err.response.statusText,
          url: err.response.config.url,
          method: err.response.config.method,
          data: err.response.data
        };
        
        if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data?.non_field_errors) {
          errorMessage = err.response.data.non_field_errors.join(', ');
        } else if (err.response.status === 401) {
          errorMessage = "Credenciales inválidas. Verifique su email y contraseña.";
        } else if (err.response.status === 404) {
          errorMessage = "Servicio de autenticación no disponible. Verifique la URL de la API.";
        }
      } else if (err.request) {
        // La solicitud se realizó pero no se recibió respuesta
        errorMessage = "No se pudo conectar con el servidor. Verifique su conexión a internet.";
        diagnosticData = {
          message: "No se recibió respuesta del servidor",
          url: err.config?.url
        };
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setDiagnosticInfo(diagnosticData);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full ${
            isDark ? 'bg-neutral-800 text-neutral-200' : 'bg-white text-neutral-600'
          } focus:outline-none`}
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full max-w-md ${
            isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-white shadow-lg'
          } rounded-xl overflow-hidden`}
        >
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="mx-auto h-12 w-12 bg-primary-500 rounded-xl flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 5.5h-15v12h15v-12z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 9.5h5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 13.5h5" />
              </svg>
            </div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Hospital Admin</h2>
            <p className={`mt-2 text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Ingrese sus credenciales para acceder
            </p>
          </div>
          
          <div className="px-8 pb-8">
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="input"
                  placeholder="usuario@hospital.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label className="label" htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="input"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 text-sm text-center text-red-700 bg-red-100 rounded-lg"
                >
                  {error}
                </motion.div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary flex justify-center items-center py-2.5"
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {isLoading ? 'Iniciando sesión...' : 'Acceder'}
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-center">
                  <p className={`${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    Credenciales preestablecidas en modo desarrollo:
                  </p>
                  <p className={`font-mono ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    admin@hospital.pe / admin123
                  </p>
                </div>
              )}
            </form>
            
            {/* Información de diagnóstico para desarrollo */}
            {diagnosticInfo && process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-3 border border-yellow-300 bg-yellow-50 rounded-lg">
                <p className="text-xs font-semibold text-yellow-700 mb-1">Información de diagnóstico:</p>
                <pre className="text-xs overflow-auto max-h-40 text-yellow-800">
                  {JSON.stringify(diagnosticInfo, null, 2)}
                </pre>
              </div>
            )}
            
            {/* Enlace a la página de depuración - solo en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 text-center">
                <Link 
                  to="/auth-debug" 
                  className={`text-xs ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                >
                  Herramientas de diagnóstico de autenticación
                </Link>
              </div>
            )}
          </div>
        </motion.div>
        
        <p className={`mt-8 text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
          API URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}
        </p>
      </div>
    </div>
  );
} 