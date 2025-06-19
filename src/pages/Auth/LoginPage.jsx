import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email({ message: "Ingrese un email válido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await login(data);
      toast.success('Inicio de sesión exitoso');
      navigate('/');
    } catch (err) {
      console.error("Error completo:", err);
      
      // Mostrar mensaje de error detallado
      let errorMessage = "Error al iniciar sesión. Por favor, inténtelo de nuevo.";
      
      if (err.response) {
        // El servidor respondió con un código de error
        console.log("Datos de respuesta:", err.response.data);
        
        if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.status === 401) {
          errorMessage = "Credenciales inválidas. Verifique su email y contraseña.";
        } else if (err.response.status === 404) {
          errorMessage = "Servicio de autenticación no disponible. Verifique la URL de la API.";
        }
      } else if (err.request) {
        // La solicitud se realizó pero no se recibió respuesta
        errorMessage = "No se pudo conectar con el servidor. Verifique su conexión a internet.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Hospital Admin</h2>
          <p className="mt-2 text-gray-600">Ingrese sus credenciales para acceder</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="admin@hospital.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          
          {error && (
            <div className="p-3 text-sm text-center text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Iniciando sesión...' : 'Acceder'}
            </button>
          </div>
          
          <div className="text-xs text-center text-gray-500">
            <p>API URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}</p>
          </div>
        </form>
      </div>
    </div>
  );
} 