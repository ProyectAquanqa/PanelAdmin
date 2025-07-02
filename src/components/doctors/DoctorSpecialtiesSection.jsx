import React from 'react';
import { CheckIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

/**
 * Componente para la sección de especialidades del formulario de doctor
 */
const DoctorSpecialtiesSection = ({ 
  selectedSpecialties, 
  specialtiesData, 
  handleSpecialtyToggle, 
  loadingSpecialties, 
  specialtiesError, 
  isDark,
  watch,
  setValue
}) => {
  const specialties = specialtiesData?.results || [];
  const primarySpecialtyId = watch('primary_specialty_id');

  const handleSetPrimary = (e, specialtyId) => {
    e.stopPropagation(); // Evitar que se active el toggle de la especialidad
    if (primarySpecialtyId === specialtyId) {
      // Si ya es primaria, deseleccionar
      setValue('primary_specialty_id', null, { shouldValidate: true });
    } else {
      setValue('primary_specialty_id', specialtyId, { shouldValidate: true });
    }
  };

  if (loadingSpecialties) {
    return (
      <div className="mt-6">
        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
          Especialidades
        </h3>
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          <span className={`ml-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Cargando especialidades...
          </span>
        </div>
      </div>
    );
  }

  if (specialtiesError) {
    return (
      <div className="mt-6">
        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
          Especialidades
        </h3>
        <div className={`p-4 rounded-md ${isDark ? 'bg-red-900/20 border border-red-700/30' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-800'}`}>
            Error al cargar especialidades. Por favor, inténtelo de nuevo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
        Especialidades
      </h3>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
        Seleccione las especialidades del doctor. Puede marcar una como la principal.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {specialties.map((specialty) => {
          const isSelected = selectedSpecialties.includes(specialty.id);
          const isPrimary = primarySpecialtyId === specialty.id;

          return (
            <div
              key={specialty.id}
              onClick={() => handleSpecialtyToggle(specialty.id)}
              className={`
                p-4 rounded-md border cursor-pointer transition-all duration-200 relative
                ${isSelected
                  ? isDark
                    ? 'bg-primary-900/40 border-primary-700/80'
                    : 'bg-primary-50 border-primary-400'
                  : isDark
                    ? 'border-gray-700 hover:border-gray-600'
                    : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`
                    w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-colors
                    ${isSelected
                      ? isDark
                        ? 'bg-primary-600 border-primary-500'
                        : 'bg-primary-600 border-primary-600'
                      : isDark
                        ? 'border-gray-600'
                        : 'border-gray-400'
                    }
                  `}>
                    {isSelected && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {specialty.name}
                  </span>
                </div>
                
                {isSelected && (
                  <button
                    type="button"
                    onClick={(e) => handleSetPrimary(e, specialty.id)}
                    className={`p-1 rounded-full transition-colors ${
                      isPrimary 
                        ? isDark ? 'text-yellow-400' : 'text-yellow-500'
                        : isDark ? 'text-gray-500 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-500'
                    }`}
                    title={isPrimary ? "Especialidad Principal" : "Marcar como principal"}
                  >
                    {isPrimary 
                      ? <StarIconSolid className="w-5 h-5" /> 
                      : <StarIcon className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {specialties.length === 0 && (
        <div className={`p-4 rounded-md ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No hay especialidades disponibles.
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorSpecialtiesSection; 