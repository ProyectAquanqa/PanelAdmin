import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../components/Auth/LoginForm';
import bgImage from '../../assets/images/bg-paneladmin.webp';
import toast from 'react-hot-toast';

/**
 * Página de inicio de sesión para el panel administrativo
 * Implementa el Módulo 1: Login Funcional (sin modificar el diseño)
 */
const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  // Color principal de la aplicación
  const mainColor = '#2D728F';
  
  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  // Función para manejar el envío del formulario conectado al backend AquanQ
  const handleLogin = async (formData) => {
    setIsLoading(true);
    setLoginError('');
    
    try {
      // Validar campos (email, contraseña) según prompt
      if (!formData.username || !formData.password) {
        throw new Error('Usuario y contraseña son obligatorios');
      }

      // Intentar autenticación con el backend AquanQ
      await login({
        username: formData.username,
        password: formData.password,
      });
      
      // Redirigir a /dashboard si la autenticación es exitosa (según prompt)
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      
      // Manejar errores (credenciales inválidas, conexión fallida) según prompt
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.message.includes('Credenciales inválidas') || 
          error.message.includes('Invalid credentials')) {
        errorMessage = 'Usuario o contraseña incorrectos';
      } else if (error.message.includes('conexión') || 
                 error.message.includes('Network') ||
                 error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setLoginError(errorMessage);
      // Toast is already handled by AuthContext, no need to duplicate
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Background con imagen completa */}
      <div className="absolute inset-0">
        {/* Imagen de fondo */}
        <div 
          className="h-full w-full bg-no-repeat bg-cover bg-center" 
          style={{
            backgroundImage: `url(${bgImage})`
          }}
        ></div>
        
        {/* Overlay con gradiente azul más notorio */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-[#1c5069]/45 to-[#2D728F]/20"></div>
      </div>

      {/* Contenido principal - área flex que ocupa toda la altura */}
      <div className="relative z-10 flex flex-grow w-full h-screen">
        {/* Sección izquierda con logo y texto informativo */}
        <div className="hidden lg:flex w-1/2 flex-col">
          {/* Contenedor centrado verticalmente */}
          <div className="flex flex-col h-full justify-center items-start px-16 xl:px-24">
            {/* Logo AquanQ */}
            <div className="mb-8">
              <h2 className="text-6xl md:text-7xl font-calligraphy text-white drop-shadow-lg mb-4">
                Aquanqa
              </h2>
              <div className="w-32 h-0.5 bg-white/70"></div>
            </div>
            
            {/* Texto informativo */}
            <div className="max-w-xl">
              <p className="text-white/90 text-lg leading-relaxed">
                Plataforma digital para la gestión de eventos y anuncios.
              </p>
              
              {/* Mostrar estado de conexión */}
              <div className="mt-6 flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  loginError && loginError.includes('conexión') 
                    ? 'bg-red-500 animate-pulse' 
                    : 'bg-green-500'
                }`}></div>
                <span className="text-white/70 text-sm">
                  {loginError && loginError.includes('conexión') 
                    ? 'Sin conexión al servidor' 
                    : 'Conectado al servidor'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección derecha con la card de login */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end items-center px-6 lg:pr-10 xl:pr-18">
          <div className="w-full max-w-[440px]">
            {/* Card del Login con fondo blanco sólido */}
            <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/20">
              {/* Encabezado */}
              <div className="mb-8">
                <div className="flex items-center mb-2">
                  <div className="h-1.5 w-8 bg-[#2D728F] rounded-full"></div>
                </div>
                <p className="text-sm text-gray-500 mb-3 tracking-wide">Bienvenido</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#2D728F]">
                  Iniciar sesión
                </h1>
              </div>

              {/* Mostrar error de login si existe */}
              {loginError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{loginError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario */}
              <LoginForm 
                onSubmit={handleLogin}
                isLoading={isLoading}
                accentColor={mainColor}
                inputStyle="subtle"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer mejorado con subrayado sutil y mejor distribución */}
      <div className="relative z-10 w-full">
        <div className="absolute bottom-0 left-0 w-full">
          <div className="border-t border-white/15">
            <div className="max-w-full w-full py-6">
              <div className="flex flex-row items-center justify-between">
                <div className="pl-16 xl:pl-24">
                  <p className="text-white/70 text-sm">
                    © {new Date().getFullYear()} AquanQ Solutions. Todos los derechos reservados.
                  </p>
                </div>
                <div className="flex flex-row items-center space-x-8 pr-16 xl:pr-24">
                  <a href="#" className="text-white/80 hover:text-white transition-colors text-sm border-b border-transparent hover:border-white/50">Acerca De</a>
                  <a href="#" className="text-white/80 hover:text-white transition-colors text-sm border-b border-transparent hover:border-white/50">Contáctanos</a>
                  <a href="#" className="text-white/80 hover:text-white transition-colors text-sm border-b border-transparent hover:border-white/50">Ayuda</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 