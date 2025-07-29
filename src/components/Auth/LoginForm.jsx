import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

/**
 * Componente de formulario de inicio de sesión
 */
const LoginForm = ({ onSubmit, isLoading, accentColor, inputStyle }) => {
  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Estado para mostrar/ocultar la contraseña
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado para errores de validación
  const [errors, setErrors] = useState({});
  
  // Color de acento por defecto
  const colorAccent = accentColor || '#2D728F';
  // Color hover (más oscuro)
  const hoverColor = '#1e5d74';
  
  // Estilos para los inputs basados en la prop inputStyle
  const getInputStyles = () => {
    switch(inputStyle) {
      case 'subtle':
        return 'bg-blue-50/60 border-blue-100/70 hover:bg-white/70 focus:bg-white/90';
      default:
        return 'bg-white border-gray-300';
    }
  };

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores al modificar el campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Campo de usuario */}
      <div>
        <label 
          htmlFor="username" 
          className="block text-sm font-medium text-gray-600 mb-2"
        >
          Usuario
        </label>
        <div className="relative">
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            className={`block w-full px-4 py-3 border ${
              errors.username 
                ? 'border-red-300/70 focus:border-red-400 focus:ring-red-300/40' 
                : `${getInputStyles()} focus:border-[${colorAccent}]/60 focus:ring-[${colorAccent}]/30`
            } rounded-xl shadow-sm focus:outline-none focus:ring-1 text-sm transition-all text-gray-900`}
            placeholder="Ingresa tu nombre de usuario"
            style={{
              '--tw-ring-color': errors.username ? 'rgb(239 68 68 / 0.3)' : `${colorAccent}30`,
              color: '#111827'
            }}
          />
          {errors.username && (
            <p className="mt-1.5 text-sm text-red-600">{errors.username}</p>
          )}
        </div>
      </div>

      {/* Campo de contraseña */}
      <div>
        <label 
          htmlFor="password" 
          className="block text-sm font-medium text-gray-600 mb-2"
        >
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            className={`block w-full px-4 py-3 border ${
              errors.password 
                ? 'border-red-300/70 focus:border-red-400 focus:ring-red-300/40' 
                : `${getInputStyles()} focus:border-[${colorAccent}]/60 focus:ring-[${colorAccent}]/30`
            } rounded-xl shadow-sm focus:outline-none focus:ring-1 text-sm transition-all pr-10 text-gray-900`}
            placeholder="Ingresa tu contraseña"
            style={{
              '--tw-ring-color': errors.password ? 'rgb(239 68 68 / 0.3)' : `${colorAccent}30`,
              color: '#111827'
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
      </div>

      {/* Botón de inicio de sesión con hover de cambio de color simple */}
      <div className="pt-3">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white shadow-sm transition-colors duration-200 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: colorAccent,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = hoverColor;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = colorAccent;
          }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Iniciando sesión...</span>
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </div>
    </form>
  );
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  accentColor: PropTypes.string,
  inputStyle: PropTypes.oneOf(['default', 'subtle'])
};

LoginForm.defaultProps = {
  isLoading: false,
  accentColor: '#2D728F',
  inputStyle: 'default'
};

export default LoginForm; 