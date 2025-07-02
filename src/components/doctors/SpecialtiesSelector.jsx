import React, { useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

/**
 * Componente para seleccionar especialidades médicas
 * 
 * @param {Object} props
 * @param {Array} props.specialties - Lista de especialidades disponibles
 * @param {Array} props.selectedSpecialties - IDs de especialidades seleccionadas
 * @param {Function} props.onToggle - Función para manejar la selección/deselección
 * @param {boolean} props.isLoading - Indica si las especialidades están cargando
 * @param {Object} props.error - Error al cargar especialidades
 * @param {Function} props.onRetry - Función para reintentar carga de especialidades
 * @param {boolean} [props.isDark=false] - Indica si se está usando el tema oscuro
 */
const SpecialtiesSelector = ({
  specialties = [],
  selectedSpecialties = [],
  onToggle,
  isLoading = false,
  error = null,
  onRetry,
  isDark = false,
}) => {
  // Debug: Imprimir datos para verificar
  useEffect(() => {
    console.log('🔍 DEBUG ESPECIALIDADES:');
    console.log('Especialidades disponibles:', specialties);
    console.log('Especialidades seleccionadas:', selectedSpecialties);
    
    // Analizar estructura de datos de especialidades
    if (specialties && specialties.length > 0) {
      console.log('Estructura de primera especialidad:', JSON.stringify(specialties[0]));
    }
  }, [specialties, selectedSpecialties]);

  if (isLoading) {
    return (
      <div className={`p-4 rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <div className="flex justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className={`ml-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Cargando especialidades...
          </p>
        </div>
      </div>
    );
  }

  if (error || specialties.length === 0) {
    return (
      <div className={`p-4 rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <p className="text-sm text-center text-red-500">
          No se pudieron cargar las especialidades. Intente nuevamente más tarde.
        </p>
        {onRetry && (
          <button
            type="button"
            className="mt-2 w-full py-1 px-2 text-sm text-center text-white bg-blue-500 rounded-md hover:bg-blue-600"
            onClick={onRetry}
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  // Función para obtener el nombre de la especialidad
  const getSpecialtyName = (specialty) => {
    if (!specialty) return 'Especialidad desconocida';
    
    // Intentar obtener el nombre de diferentes propiedades posibles
    if (typeof specialty === 'string') return specialty;
    
    if (specialty.name) return specialty.name;
    if (specialty.specialty_name) return specialty.specialty_name;
    if (specialty.specialty && specialty.specialty.name) return specialty.specialty.name;
    
    // Si no hay nombre, mostrar un mensaje más descriptivo
    return `Especialidad sin nombre (ID: ${specialty.id || specialty.specialty_id || 'desconocido'})`;
  };

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 p-3 rounded-md border ${
      isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'
    }`}>
      {specialties.length > 0 ? (
        specialties.map((specialty) => {
          const specialtyId = typeof specialty === 'object' ? specialty.id : specialty;
          const isSelected = selectedSpecialties.includes(specialtyId);
          
          return (
            <div 
              key={specialtyId}
              className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                isSelected 
                  ? isDark 
                    ? 'bg-indigo-900 border border-indigo-700' 
                    : 'bg-indigo-100 border border-indigo-300'
                  : isDark 
                    ? 'hover:bg-gray-700 border border-gray-700' 
                    : 'hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => onToggle(specialtyId)}
            >
              <div className={`h-4 w-4 rounded mr-2 flex items-center justify-center ${
                isSelected 
                  ? 'bg-indigo-600' 
                  : isDark ? 'bg-gray-600' : 'bg-white border border-gray-300'
              }`}>
                {isSelected && (
                  <CheckCircleIcon className="h-3 w-3 text-white" />
                )}
              </div>
              <span className={`text-sm font-medium ${
                isDark 
                  ? isSelected ? 'text-indigo-200' : 'text-gray-200' 
                  : isSelected ? 'text-indigo-800' : 'text-gray-700'
              }`}>
                {getSpecialtyName(specialty)}
              </span>
            </div>
          );
        })
      ) : (
        <div className="col-span-3 py-4 text-center">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No hay especialidades disponibles
          </p>
        </div>
      )}
    </div>
  );
};

export default SpecialtiesSelector; 