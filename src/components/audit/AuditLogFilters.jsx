import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import auditService from '../../services/auditService';
import useDebounce from '../../hooks/useDebounce';

// Objeto para traducir los nombres de los módulos a español
// Las claves deben estar en singular para coincidir con el backend
const moduleTranslations = {
  authentication: 'Autenticación',
  user: 'Usuarios',
  doctor: 'Doctores',
  patient: 'Pacientes',
  appointment: 'Citas',
  payment: 'Pagos',
  catalog: 'Catálogos',
  setting: 'Configuraciones',
  // Añadir más si es necesario
};

const AuditLogFilters = ({ onFilterChange, onReset, initialFilters }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [choices, setChoices] = useState({
    operation_types: [],
    modules: [],
    entity_names: [],
  });

  const debouncedSearchTerm = useDebounce(filters.search, 500);

  useEffect(() => {
    const fetchChoices = async () => {
      try {
        const data = await auditService.getFilterChoices();
        setChoices(data);
      } catch (error) {
        console.error("Failed to fetch filter choices:", error);
      }
    };
    fetchChoices();
  }, []);

  // Efecto solo para el término de búsqueda, que se aplica dinámicamente
  useEffect(() => {
    // Se asegura de no dispararse en la carga inicial si no hay búsqueda
    if (debouncedSearchTerm !== initialFilters.search) {
      onFilterChange({ search: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFilters(prev => ({
      ...prev,
      created_at_gte: start,
      created_at_lte: end,
    }));
  };
  
  // Aplica los filtros que no son de búsqueda (fechas, selects)
  const handleApply = () => {
    // Excluye 'search' que se maneja con debouncing
    const { search, ...otherFilters } = filters;
    
    // Construye los filtros a aplicar de forma dinámica
    const filtersToApply = { ...otherFilters };

    // Formatea las fechas solo si existen, de lo contrario, no se envían
    if (filtersToApply.created_at_gte) {
      filtersToApply.created_at_gte = format(filtersToApply.created_at_gte, 'yyyy-MM-dd');
    } else {
      delete filtersToApply.created_at_gte; // Elimina la clave si no hay fecha
    }

    if (filtersToApply.created_at_lte) {
      filtersToApply.created_at_lte = format(filtersToApply.created_at_lte, 'yyyy-MM-dd');
    } else {
      delete filtersToApply.created_at_lte; // Elimina la clave si no hay fecha
    }
    
    // Envía solo los filtros que tienen valor
    onFilterChange(filtersToApply);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    onReset();
  };

  return (
    <div className="p-4 bg-gray-50 border rounded-lg mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col lg:col-span-1">
          <label htmlFor="search" className="mb-1 text-sm font-medium text-gray-700">Término de Búsqueda (Dinámico)</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleChange}
            className="p-2 border rounded-md"
            placeholder="Buscar por usuario, IP, descripción..."
          />
        </div>
        
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Rango de Fechas</label>
          <DatePicker
            selectsRange
            startDate={filters.created_at_gte}
            endDate={filters.created_at_lte}
            onChange={handleDateChange}
            isClearable
            className="w-full p-2 border rounded-md"
            dateFormat="yyyy-MM-dd"
            placeholderText="Seleccione un rango"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="operation_type" className="mb-1 text-sm font-medium text-gray-700">Tipo de Operación</label>
          <select
            id="operation_type"
            name="operation_type"
            value={filters.operation_type}
            onChange={handleChange}
            className="p-2 border rounded-md"
          >
            <option value="">Todos</option>
            {choices.operation_types.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="module" className="mb-1 text-sm font-medium text-gray-700">Módulo</label>
          <select
            id="module"
            name="module"
            value={filters.module}
            onChange={handleChange}
            className="p-2 border rounded-md"
          >
            <option value="">Todos</option>
            {choices.modules.map(mod => (
              <option key={mod} value={mod}>
                {moduleTranslations[mod] || mod}
              </option>
            ))}
          </select>
        </div>

      </div>
      <div className="flex justify-end mt-4 gap-2">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
        >
          Limpiar Filtros
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};

export default AuditLogFilters; 