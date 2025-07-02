import React from 'react';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

/**
 * Componente de filtros para la página de citas
 * @param {Object} props - Propiedades del componente
 * @param {string} props.searchTerm - Término de búsqueda
 * @param {Function} props.setSearchTerm - Función para actualizar el término de búsqueda
 * @param {string} props.statusFilter - Filtro de estado
 * @param {Function} props.setStatusFilter - Función para actualizar el filtro de estado
 * @param {string} props.dateFilter - Filtro de fecha
 * @param {Function} props.setDateFilter - Función para actualizar el filtro de fecha
 * @param {Function} props.handleSearch - Función para manejar la búsqueda
 * @param {Function} props.handleClearFilters - Función para limpiar los filtros
 * @param {string} props.theme - Tema actual ('dark' o 'light')
 * @returns {JSX.Element} Componente de filtros
 */
const AppointmentFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  dateFilter, 
  setDateFilter, 
  handleSearch, 
  handleClearFilters, 
  theme 
}) => {
  const darkMode = theme === 'dark';
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${
        darkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'
      } shadow-sm border rounded-xl p-6 mb-6`}
    >
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda por texto */}
          <div>
            <label htmlFor="search" className={`block text-sm font-medium ${
              darkMode ? 'text-neutral-300' : 'text-gray-700'
            }`}>
              Buscar
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 ${
                  darkMode ? 'text-neutral-500' : 'text-gray-400'
                }`} />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' 
                    : 'border-gray-300 placeholder-gray-400'
                }`}
                placeholder="Paciente, doctor, etc."
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div>
            <label htmlFor="status" className={`block text-sm font-medium ${
              darkMode ? 'text-neutral-300' : 'text-gray-700'
            }`}>
              Estado
            </label>
            <select
              id="status"
              name="status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className={`mt-1 block w-full pl-3 pr-10 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-neutral-700 border-neutral-600 text-white' 
                  : 'border-gray-300'
              }`}
            >
              <option value="">Todos los estados</option>
              <option value="SCHEDULED">Programada</option>
              <option value="IN_CONSULTATION">En consulta</option>
              <option value="COMPLETED">Completada</option>
              <option value="CANCELLED">Cancelada</option>
              <option value="NO_SHOW">No se presentó</option>
            </select>
          </div>

          {/* Filtro por fecha */}
          <div>
            <label htmlFor="date" className={`block text-sm font-medium ${
              darkMode ? 'text-neutral-300' : 'text-gray-700'
            }`}>
              Fecha
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={dateFilter}
              onChange={handleDateFilterChange}
              className={`mt-1 block w-full pl-3 pr-10 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-neutral-700 border-neutral-600 text-white' 
                  : 'border-gray-300'
              }`}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClearFilters}
            className={`px-4 py-2 border rounded-md text-sm font-medium ${
              darkMode 
                ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Limpiar filtros
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium"
          >
            <MagnifyingGlassIcon className="h-4 w-4 inline-block mr-1" />
            Buscar
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={`px-4 py-2 border rounded-md text-sm font-medium ${
              darkMode 
                ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title="Recargar página"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );

  function handleStatusFilterChange(e) {
    setStatusFilter(e.target.value);
  }

  function handleDateFilterChange(e) {
    setDateFilter(e.target.value);
  }
};

export default AppointmentFilters; 