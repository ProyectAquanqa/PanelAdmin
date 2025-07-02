import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import AppointmentStatusBadge from './AppointmentStatusBadge';
import { formatDate, formatTimeBlock } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/dataUtils';

/**
 * Modal para mostrar los detalles de una cita.
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Indica si el modal está abierto.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {object} props.appointment - La cita a mostrar.
 * @returns {JSX.Element|null}
 */
const AppointmentDetailsModal = ({ isOpen, onClose, appointment }) => {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  if (!isOpen || !appointment) {
    return null;
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { y: "-50%", opacity: 0 },
    visible: { y: "0%", opacity: 1 },
    exit: { y: "50%", opacity: 0 },
  };

  const DetailItem = ({ label, value, isBadge = false }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className={`text-sm font-medium ${darkMode ? 'text-neutral-400' : 'text-gray-500'}`}>{label}</dt>
      <dd className={`mt-1 text-sm sm:mt-0 sm:col-span-2 ${darkMode ? 'text-neutral-200' : 'text-gray-900'}`}>
        {isBadge ? value : <span>{value || 'No especificado'}</span>}
      </dd>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          onClick={onClose}
        >
          <motion.div
            className={`relative rounded-xl shadow-xl w-full max-w-2xl ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex justify-between items-center p-5 border-b ${darkMode ? 'border-neutral-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Detalles de la Cita #{appointment.id}
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${darkMode ? 'text-neutral-400 hover:bg-neutral-700' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <dl className={`divide-y ${darkMode ? 'divide-neutral-700' : 'divide-gray-200'}`}>
                <DetailItem label="Paciente" value={appointment.patient?.full_name || `${appointment.patient?.first_name} ${appointment.patient?.last_name}`} />
                <DetailItem label="Doctor" value={appointment.doctor?.full_name || `${appointment.doctor?.first_name} ${appointment.doctor?.last_name}`} />
                <DetailItem label="Especialidad" value={appointment.specialty?.name} />
                <DetailItem label="Fecha" value={formatDate(appointment.appointment_date)} />
                <DetailItem label="Horario" value={formatTimeBlock(appointment.time_block)} />
                <DetailItem label="Estado" value={<AppointmentStatusBadge status={appointment.status} theme={theme} />} isBadge={true} />
                <DetailItem label="Motivo de la consulta" value={appointment.reason} />
                <DetailItem label="Precio" value={formatCurrency(appointment.price)} />
                <DetailItem label="Estado del Pago" value={appointment.payment_status} />
                <DetailItem label="Fecha de Creación" value={new Date(appointment.created_at).toLocaleString()} />
              </dl>
            </div>

            <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t ${darkMode ? 'border-neutral-700' : 'border-gray-200'}`}>
              <button
                type="button"
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium sm:ml-3 sm:w-auto sm:text-sm ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentDetailsModal; 