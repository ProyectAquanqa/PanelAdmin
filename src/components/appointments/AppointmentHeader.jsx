import React from 'react';
import { CalendarIcon, PlusIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

/**
 * Componente de encabezado para la página de citas
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onNewAppointment - Función para manejar el clic en el botón de nueva cita
 * @param {string} props.theme - Tema actual ('dark' o 'light')
 * @returns {JSX.Element} Componente de encabezado
 */
const AppointmentHeader = ({ onNewAppointment, theme }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        theme === 'dark' 
          ? 'bg-neutral-800 border-neutral-700' 
          : 'bg-white border-gray-200'
      } shadow-sm border rounded-xl p-6 mb-6`}
    >
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          } flex items-center`}>
            <CalendarIcon className="h-7 w-7 text-primary-600 mr-3" />
            Citas Médicas
          </h1>
          <p className={`mt-2 text-sm ${
            theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'
          }`}>
            Gestiona las citas médicas del hospital
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onNewAppointment}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-all duration-200"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nueva Cita
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AppointmentHeader; 