import { useState, useEffect } from 'react';
import { useGetSpecialties } from '../../hooks/useSpecialties';
import { useTheme } from '../../context/ThemeContext';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

/**
 * Componente para seleccionar especialidades médicas
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.selectedSpecialties - IDs de especialidades seleccionadas
 * @param {Function} props.onChange - Función a llamar cuando cambia la selección
 * @param {boolean} props.isReadOnly - Indica si es de solo lectura
 */
export default function SpecialtySelector({ selectedSpecialties = [], onChange, isReadOnly = false }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Obtener especialidades
  const { data: specialtiesData, isLoading, error } = useGetSpecialties();
  const specialties = specialtiesData?.results || [];
  
  // Estado local para manejar selección
  const [selected, setSelected] = useState([]);
  
  // Sincronizar con prop externa
  useEffect(() => {
    // Convertir a números si son strings
    const normalizedSelected = selectedSpecialties.map(id => 
      typeof id === 'string' ? parseInt(id, 10) : id
    );
    setSelected(normalizedSelected);
  }, [selectedSpecialties]);
  
  // Manejar selección de especialidad
  const handleToggleSpecialty = (specialtyId) => {
    if (isReadOnly) return;
    
    // Convertir a número si es string
    const id = typeof specialtyId === 'string' ? parseInt(specialtyId, 10) : specialtyId;
    
    let newSelected;
    if (selected.includes(id)) {
      // Quitar de la selección
      newSelected = selected.filter(s => s !== id);
    } else {
      // Agregar a la selección
      newSelected = [...selected, id];
    }
    
    // Actualizar estado local
    setSelected(newSelected);
    
    // Notificar cambio
    if (onChange) {
      onChange(newSelected);
    }
  };
  
  // Mostrar mensaje de carga
  if (isLoading) {
    return (
      <div className={`p-4 rounded-lg border ${isDark ? 'border-neutral-700 bg-neutral-800' : 'border-gray-200 bg-white'}`}>
        <div className="flex justify-center items-center py-6">
          <div className="w-6 h-6 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          <p className={`ml-3 text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
            Cargando especialidades...
          </p>
        </div>
      </div>
    );
  }
  
  // Mostrar mensaje de error
  if (error) {
    return (
      <div className={`p-4 rounded-lg border ${isDark ? 'border-red-800 bg-red-900/20' : 'border-red-200 bg-red-50'}`}>
        <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          Error al cargar especialidades: {error.message || 'Error desconocido'}
        </p>
      </div>
    );
  }
  
  // Si no hay especialidades
  if (!specialties || specialties.length === 0) {
    return (
      <div className={`p-4 rounded-lg border ${isDark ? 'border-neutral-700 bg-neutral-800' : 'border-gray-200 bg-white'}`}>
        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
          No hay especialidades disponibles
        </p>
      </div>
    );
  }
  
  return (
    <div className={`p-4 rounded-lg border ${isDark ? 'border-neutral-700 bg-neutral-800' : 'border-gray-200 bg-white'}`}>
      <div className="mb-3">
        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Especialidades ({selected.length} seleccionadas)
        </h4>
        <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
          Seleccione las especialidades del doctor
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {specialties.map(specialty => {
          const isSelected = selected.includes(specialty.id);
          
          return (
            <button
              key={specialty.id}
              type="button"
              onClick={() => handleToggleSpecialty(specialty.id)}
              disabled={isReadOnly}
              className={`
                flex items-center justify-between p-3 rounded-lg border text-left
                ${isReadOnly ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
                ${isSelected 
                  ? isDark 
                    ? 'bg-primary-900/30 border-primary-700/50 text-primary-200' 
                    : 'bg-primary-50 border-primary-200 text-primary-800'
                  : isDark 
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }
                transition-colors duration-150
              `}
            >
              <div className="flex flex-col">
                <span className="font-medium text-sm">{specialty.name}</span>
                {specialty.consultation_price && (
                  <span className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                    S/. {specialty.consultation_price.toFixed(2)}
                  </span>
                )}
              </div>
              
              {isSelected && (
                <CheckCircleIcon className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
              )}
            </button>
          );
        })}
      </div>
      
      {selected.length === 0 && !isReadOnly && (
        <p className={`mt-3 text-xs ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
          Debe seleccionar al menos una especialidad
        </p>
      )}
    </div>
  );
} 