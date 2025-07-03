import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeftIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useGetPatientById } from '../../hooks/usePatients';
import { useGetAppointmentsByPatient } from '../../hooks/appointment/useAppointmentQueries';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
  const { theme } = useTheme();
  const statusStyles = {
    COMPLETED: `bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`,
    CANCELLED: `bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`,
    SCHEDULED: `bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`,
    PENDING: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`,
    'NO-SHOW': `bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-300`,
  };

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || statusStyles['PENDING']}`}>
      {status ? status.replace('_', ' ') : 'N/A'}
    </span>
  );
};

export default function AppointmentHistoryPage() {
  const { patientId } = useParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { data: patient, isLoading: isLoadingPatient, error: errorPatient } = useGetPatientById(patientId);
  const { data: appointmentsData, isLoading: isLoadingAppointments, error: errorAppointments } = useGetAppointmentsByPatient(patientId);
  
  const appointments = appointmentsData?.results || [];

  const isLoading = isLoadingPatient || isLoadingAppointments;
  const error = errorPatient || errorAppointments;

  if (isLoading) {
    return (
        <div className={`p-6 md:p-8 rounded-3xl ${isDark ? 'bg-neutral-900' : 'bg-gray-50'}`}>
            <div className="text-center">Cargando historial...</div>
        </div>
    );
  }
  
  if (error) {
    return (
        <div className={`p-6 md:p-8 rounded-3xl ${isDark ? 'bg-neutral-900' : 'bg-gray-50'}`}>
            <div className="text-center text-red-500">Error al cargar el historial: {error.message}</div>
        </div>
    );
  }
  
  return (
    <div className={`p-6 md:p-8 rounded-3xl ${isDark ? 'bg-neutral-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <Link to="/patients" className={`flex items-center text-sm font-medium mb-4 ${isDark ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-800'}`}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Volver a la lista de pacientes
        </Link>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Historial de Citas
        </h1>
        <p className={`${isDark ? 'text-neutral-400' : 'text-gray-600'} mt-2`}>
          Paciente: <span className="font-semibold">{patient?.full_name || 'Desconocido'}</span> (ID: {patientId})
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className={`border rounded-lg ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
          <table className={`min-w-full divide-y ${isDark ? 'divide-neutral-800' : 'divide-gray-200'}`}>
            <thead className={`${isDark ? 'bg-neutral-800/50' : 'bg-gray-50'}`}>
              <tr>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Fecha</th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Doctor</th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Especialidad</th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Estado</th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Costo</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-neutral-800 bg-neutral-900' : 'divide-gray-200 bg-white'}`}>
              {appointments && appointments.length > 0 ? (
                appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{format(new Date(appt.appointment_date), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{appt.doctor_name || 'No asignado'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{appt.specialty_name || 'No asignada'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={appt.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">S/ {appt.final_price || '0.00'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center">
                      <CalendarDaysIcon className={`h-12 w-12 mb-2 ${isDark ? 'text-neutral-600' : 'text-gray-400'}`} />
                      <p className={`${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>No se encontraron citas para este paciente.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 