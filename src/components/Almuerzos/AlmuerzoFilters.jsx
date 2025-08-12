import React from 'react';
import PropTypes from 'prop-types';
import CustomDropdown from '../Common/CustomDropdown';

/**
 * Componente de filtros para Almuerzos - Implementación simple y directa
 */
const AlmuerzoFilters = ({
  searchTerm = '',
  onSearchChange,
  selectedStatus = '',
  onStatusChange,
  selectedHoliday = '',
  onHolidayChange,
  selectedDiet = '',
  onDietChange,
  onCreateNew,
  totalItems = 0
}) => {
  // Opciones para los filtros
  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'true', label: 'Activos' },
    { value: 'false', label: 'Inactivos' }
  ];

  const holidayOptions = [
    { value: '', label: 'Todos' },
    { value: 'true', label: 'Solo feriados' },
    { value: 'false', label: 'Sin feriados' }
  ];

  const dietOptions = [
    { value: '', label: 'Todos' },
    { value: 'with_diet', label: 'Con dieta' },
    { value: 'without_diet', label: 'Sin dieta' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-6">
      {/* Header con contador y botón */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Barra de búsqueda */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por entrada, plato de fondo, refresco o dieta..."
                value={searchTerm}
                onChange={(e) => {
                  console.log('🔍 Search input cambió:', e.target.value);
                  onSearchChange?.(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F]/30 transition-all bg-gray-50/30 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Filtro de Estado */}
          <div className="min-w-[160px]">
            <CustomDropdown
              value={selectedStatus}
              onChange={(value) => {
                console.log('🔍 Status cambió:', value);
                onStatusChange?.(value);
              }}
              options={statusOptions}
              placeholder="Estado"
              showIcon={true}
              className="h-[50px]"
            />
          </div>

          {/* Filtro de Feriado */}
          <div className="min-w-[160px]">
            <CustomDropdown
              value={selectedHoliday}
              onChange={(value) => {
                console.log('🔍 Holiday cambió:', value);
                onHolidayChange?.(value);
              }}
              options={holidayOptions}
              placeholder="Feriado"
              showIcon={true}
              className="h-[50px]"
            />
          </div>

          {/* Filtro de Dieta */}
          <div className="min-w-[160px]">
            <CustomDropdown
              value={selectedDiet}
              onChange={(value) => {
                console.log('🔍 Diet cambió:', value);
                onDietChange?.(value);
              }}
              options={dietOptions}
              placeholder="Dieta"
              showIcon={true}
              className="h-[50px]"
            />
          </div>
        </div>

        {/* Botón crear */}
        <button
          onClick={onCreateNew}
          className="bg-[#2D728F] hover:bg-[#235A6F] text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Almuerzo
        </button>
      </div>

      {/* Contador de resultados */}
      <div className="text-sm text-gray-500">
        {totalItems === 0 ? 'No hay almuerzos' : 
         totalItems === 1 ? '1 almuerzo' : 
         `${totalItems.toLocaleString()} almuerzos`}
      </div>
    </div>
  );
};

AlmuerzoFilters.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  selectedStatus: PropTypes.string,
  onStatusChange: PropTypes.func,
  selectedHoliday: PropTypes.string,
  onHolidayChange: PropTypes.func,
  selectedDiet: PropTypes.string,
  onDietChange: PropTypes.func,
  onCreateNew: PropTypes.func,
  totalItems: PropTypes.number
};

export default AlmuerzoFilters;
