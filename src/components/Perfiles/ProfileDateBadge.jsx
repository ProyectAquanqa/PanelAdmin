/**
 * Badge de fecha para mostrar cuándo fue creado un perfil
 * Resalta los perfiles nuevos (últimas 24 horas)
 */

import React from 'react';
import PropTypes from 'prop-types';
import { StarIcon } from '@heroicons/react/24/outline';

/**
 * Calcula si un perfil es "nuevo" (creado en las últimas 24 horas)
 * @param {string} fechaCreacion - Fecha de creación del perfil
 * @returns {boolean} true si es nuevo
 */
const esPerfilNuevo = (fechaCreacion) => {
  if (!fechaCreacion) return false;
  
  const fecha = new Date(fechaCreacion);
  if (isNaN(fecha.getTime())) return false;
  
  const ahora = new Date();
  const diferencia = ahora.getTime() - fecha.getTime();
  const unDiaEnMs = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
  
  return diferencia <= unDiaEnMs;
};

/**
 * Formatea una fecha para mostrar de forma amigable
 * @param {string} fechaCreacion - Fecha de creación 
 * @returns {string} Fecha formateada
 */
const formatearFechaCreacion = (fechaCreacion) => {
  if (!fechaCreacion) return 'Sin fecha';
  
  const fecha = new Date(fechaCreacion);
  if (isNaN(fecha.getTime())) return 'Fecha inválida';
  
  const ahora = new Date();
  const diferencia = ahora.getTime() - fecha.getTime();
  
  // Menos de 1 hora
  if (diferencia < 60 * 60 * 1000) {
    const minutos = Math.floor(diferencia / (60 * 1000));
    return `Hace ${minutos} min`;
  }
  
  // Menos de 24 horas
  if (diferencia < 24 * 60 * 60 * 1000) {
    const horas = Math.floor(diferencia / (60 * 60 * 1000));
    return `Hace ${horas}h`;
  }
  
  // Menos de 7 días
  if (diferencia < 7 * 24 * 60 * 60 * 1000) {
    const dias = Math.floor(diferencia / (24 * 60 * 60 * 1000));
    return `Hace ${dias}d`;
  }
  
  // Más de una semana - mostrar fecha
  return fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit', 
    year: '2-digit'
  });
};

/**
 * Componente ProfileDateBadge
 * Muestra la fecha de creación con badge especial para perfiles nuevos
 */
const ProfileDateBadge = ({ 
  profile, 
  showNewBadge = true,
  showDate = true,
  className = ''
}) => {
  const fechaCreacion = profile?.created_at || profile?.date_joined || profile?.created || profile?.date_created;
  const esNuevo = showNewBadge && esPerfilNuevo(fechaCreacion);
  const fechaFormateada = formatearFechaCreacion(fechaCreacion);
  
  if (!fechaCreacion && !showDate) return null;
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Badge "NUEVO" */}
      {esNuevo && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-800 border border-green-200 animate-pulse">
          <StarIcon className="w-3 h-3 mr-1" />
          NUEVO
        </span>
      )}
      
      {/* Fecha de creación */}
      {showDate && (
        <span className={`text-[12px] ${esNuevo ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
          {fechaFormateada}
        </span>
      )}
    </div>
  );
};

ProfileDateBadge.propTypes = {
  profile: PropTypes.object.isRequired,
  showNewBadge: PropTypes.bool,
  showDate: PropTypes.bool,
  className: PropTypes.string
};

export default ProfileDateBadge;
export { esPerfilNuevo, formatearFechaCreacion };
