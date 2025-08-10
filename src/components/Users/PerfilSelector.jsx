/**
 * Componente selector de perfil para usuarios
 * Muestra perfiles disponibles según el tipo de usuario seleccionado
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import userService from '../../services/userService';

const PerfilSelector = ({
  tipoUsuario,
  perfilSeleccionado,
  onPerfilChange,
  disabled = false,
  error = ''
}) => {
  const [perfilesDisponibles, setPerfilesDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar perfiles cuando cambie el tipo de usuario
  useEffect(() => {
    const loadPerfiles = async () => {
      if (!tipoUsuario) {
        setPerfilesDisponibles([]);
        return;
      }

      setLoading(true);
      try {
        const result = await userService.getPerfilesDisponibles(tipoUsuario);
        if (result.success) {
          setPerfilesDisponibles(result.data.data || []);
        } else {
          console.error('Error al cargar perfiles:', result.error);
          setPerfilesDisponibles([]);
        }
      } catch (error) {
        console.error('Error al cargar perfiles:', error);
        setPerfilesDisponibles([]);
      } finally {
        setLoading(false);
      }
    };

    loadPerfiles();
  }, [tipoUsuario]);

  // Resetear perfil seleccionado si no está disponible
  useEffect(() => {
    if (perfilSeleccionado && perfilesDisponibles.length > 0) {
      const perfilValido = perfilesDisponibles.find(p => p.id.toString() === perfilSeleccionado.toString());
      if (!perfilValido) {
        onPerfilChange?.('');
      }
    }
  }, [perfilesDisponibles, perfilSeleccionado, onPerfilChange]);

  const handleChange = (e) => {
    onPerfilChange?.(e.target.value);
  };

  const getPlaceholderText = () => {
    if (!tipoUsuario) return 'Primero selecciona el tipo de usuario';
    if (loading) return 'Cargando perfiles...';
    if (perfilesDisponibles.length === 0) return 'No hay perfiles disponibles';
    return 'Seleccionar perfil...';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Perfil *
      </label>
      <select
        value={perfilSeleccionado || ''}
        onChange={handleChange}
        disabled={disabled || !tipoUsuario || loading}
        className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      >
        <option value="">{getPlaceholderText()}</option>
        {perfilesDisponibles.map(perfil => (
          <option key={perfil.id} value={perfil.id}>
            {perfil.nombre} - {perfil.descripcion}
          </option>
        ))}
      </select>
      
      {/* Información del perfil seleccionado */}
      {perfilSeleccionado && perfilesDisponibles.length > 0 && (
        (() => {
          const perfilInfo = perfilesDisponibles.find(p => p.id.toString() === perfilSeleccionado.toString());
          return perfilInfo ? (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-xs text-blue-700">
                <p><strong>Tipo de acceso:</strong> {
                  perfilInfo.tipo_acceso === 'AMBOS' ? 'Web y Móvil' :
                  perfilInfo.tipo_acceso === 'WEB' ? 'Solo Web' : 'Solo Móvil'
                }</p>
                <p><strong>Tipo:</strong> {perfilInfo.is_admin_profile ? 'Administrativo' : 'Trabajador'}</p>
                <p><strong>Usuarios asignados:</strong> {perfilInfo.usuarios_count || 0}</p>
              </div>
            </div>
          ) : null;
        })()
      )}
      
      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

PerfilSelector.propTypes = {
  tipoUsuario: PropTypes.string,
  perfilSeleccionado: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onPerfilChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string
};

export default PerfilSelector;