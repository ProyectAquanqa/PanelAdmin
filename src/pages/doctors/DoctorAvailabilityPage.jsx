import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useGetDoctorById, useGetDoctors } from '../../hooks/useDoctors';
import { useGetDoctorAvailability } from '../../hooks/useAvailability';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  CalendarDaysIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import DoctorAvailabilityViewer from '../../components/doctors/DoctorAvailabilityViewer';

export default function DoctorAvailabilityPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDoctorId, setSelectedDoctorId] = useState(id || null);
  
  // Obtener la lista de doctores si no hay ID específico
  const { 
    data: doctorsData,
    isLoading: loadingDoctors 
  } = useGetDoctors();
  
  // Obtener datos del doctor seleccionado
  const { 
    data: doctor, 
    isLoading: loadingDoctor, 
    isError: doctorError,
    error: doctorErrorData
  } = useGetDoctorById(selectedDoctorId, { 
    enabled: !!selectedDoctorId 
  });
  
  // Obtener disponibilidades del doctor
  const {
    data: doctorAvailabilities,
    isLoading: loadingAvailabilities,
    refetch: refetchAvailabilities
  } = useGetDoctorAvailability(selectedDoctorId, {
    enabled: !!selectedDoctorId
  });
  
  // Volver a la lista de doctores
  const handleGoBack = () => {
    navigate('/doctors');
  };

  // Ir a la página de programación
  const handleGoToSchedule = () => {
    if (selectedDoctorId) {
      navigate(`/doctors/schedule/${selectedDoctorId}`);
    } else {
      toast.error('Seleccione un doctor primero');
    }
  };
  
  // Manejar cambio de doctor seleccionado
  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    setSelectedDoctorId(doctorId);
    if (doctorId) {
      // Actualizar la URL sin recargar la página
      navigate(`/doctors/availability/${doctorId}`, { replace: true });
    } else {
      navigate('/doctors/availability', { replace: true });
    }
  };
  
  // Mostrar pantalla de carga para la lista de doctores
  if (loadingDoctors && !id) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
        <p className={`ml-3 text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
          Cargando doctores...
        </p>
      </div>
    );
  }
  
  // Mostrar pantalla de carga para un doctor específico
  if (selectedDoctorId && loadingDoctor) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
        <p className={`ml-3 text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
          Cargando datos del doctor...
        </p>
      </div>
    );
  }
  
  // Mostrar error
  if (selectedDoctorId && doctorError) {
    return (
      <div className={`rounded-lg p-6 ${isDark ? 'bg-red-900/20 border border-red-700/30' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-start">
          <ExclamationTriangleIcon className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          <div className="ml-3">
            <h3 className={`text-lg font-medium ${isDark ? 'text-red-400' : 'text-red-800'}`}>
              Error al cargar el doctor
            </h3>
            <p className={`mt-2 text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
              {doctorErrorData?.message || 'No se pudo cargar la información del doctor'}
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoBack}
                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                  isDark 
                    ? 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Volver a la lista de doctores
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className={`rounded-lg shadow-sm border ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <button
                type="button"
                onClick={handleGoBack}
                className={`p-2 rounded-full mr-4 ${
                  isDark 
                    ? 'hover:bg-neutral-700 text-neutral-300' 
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Disponibilidad del Doctor
                </h1>
                
                {selectedDoctorId && doctor ? (
                <div className="flex items-center mt-1">
                  <UserIcon className={`w-4 h-4 mr-1 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`} />
                  <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-600'}`}>
                    {doctor.full_name || `${doctor.first_name} ${doctor.last_name}`}
                  </p>
                  
                  <span className={`mx-2 text-xs ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>•</span>
                  
                  <span className={`text-xs ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                    CMP: {doctor.cmp_number}
                  </span>
                  
                  <span className={`mx-2 text-xs ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>•</span>
                  
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    doctor.is_active 
                      ? isDark 
                        ? 'bg-green-900/20 text-green-400 border border-green-700/30' 
                        : 'bg-green-100 text-green-800' 
                      : isDark 
                        ? 'bg-red-900/20 text-red-400 border border-red-700/30' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {doctor.is_active ? (
                      <>
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Activo
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-3 h-3 mr-1" />
                        Inactivo
                      </>
                    )}
                  </span>
                </div>
                ) : (
                  <p className={`mt-1 text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                    Seleccione un doctor para ver su disponibilidad
                  </p>
                )}
              </div>
            </div>
            
            {selectedDoctorId && (
            <button
              type="button"
              onClick={handleGoToSchedule}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                isDark 
                  ? 'bg-primary-600 hover:bg-primary-700 text-white border-primary-700' 
                  : 'bg-primary-600 hover:bg-primary-700 text-white border-primary-600'
              }`}
            >
              <CalendarDaysIcon className="w-4 h-4 mr-2" />
              Administrar Horarios
            </button>
            )}
          </div>
          
          {/* Selector de doctor */}
          {!id && doctorsData && (
            <div className="mt-6">
              <label 
                htmlFor="doctor-select" 
                className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-1`}
              >
                Seleccione un doctor
              </label>
              <select
                id="doctor-select"
                value={selectedDoctorId || ''}
                onChange={handleDoctorChange}
                className={`block w-full rounded-md border ${
                  isDark 
                    ? 'bg-neutral-700 border-neutral-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              >
                <option value="">-- Seleccione un doctor --</option>
                {doctorsData.results && doctorsData.results
                  .filter(d => d.is_active)
                  .map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.first_name} {doctor.last_name} - CMP: {doctor.cmp_number}
                    </option>
                  ))
                }
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Contenido principal */}
      {selectedDoctorId ? (
      <div className="space-y-6">
        {loadingAvailabilities ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
            <p className={`ml-3 text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
              Cargando disponibilidad...
            </p>
          </div>
          ) : doctorAvailabilities && doctorAvailabilities.results && doctorAvailabilities.results.length > 0 ? (
          <DoctorAvailabilityViewer 
              availabilities={doctorAvailabilities.results}
              doctorId={parseInt(selectedDoctorId, 10)}
              doctorName={doctor ? `${doctor.first_name} ${doctor.last_name}` : ''}
          />
        ) : (
          <div className={`p-6 rounded-lg border text-center ${isDark ? 'border-neutral-700 bg-neutral-800' : 'border-gray-200 bg-gray-50'}`}>
            <ClockIcon className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-neutral-400' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>
              No hay horarios disponibles
            </h3>
            <p className={`max-w-md mx-auto mb-4 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
              Este doctor no tiene horarios configurados. Puedes configurar los horarios para que los pacientes puedan reservar citas.
            </p>
            <button
              type="button"
              onClick={handleGoToSchedule}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                isDark 
                  ? 'bg-primary-600 hover:bg-primary-700 text-white border-primary-700' 
                  : 'bg-primary-600 hover:bg-primary-700 text-white border-primary-600'
              }`}
            >
              <CalendarDaysIcon className="w-4 h-4 mr-2" />
              Configurar Horarios
            </button>
          </div>
        )}
        
        <div className={`p-4 rounded-lg border ${isDark ? 'border-blue-700/50 bg-blue-900/20' : 'border-blue-200 bg-blue-50'}`}>
          <div className="flex">
            <ExclamationTriangleIcon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <div className="ml-3">
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Esta vista muestra los horarios disponibles para que los pacientes puedan agendar citas con este doctor. Para modificar los horarios, haga clic en "Administrar Horarios".
              </p>
            </div>
          </div>
        </div>
      </div>
      ) : (
        <div className={`p-6 rounded-lg border text-center ${isDark ? 'border-neutral-700 bg-neutral-800' : 'border-gray-200 bg-gray-50'}`}>
          <UserIcon className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-neutral-400' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>
            Seleccione un doctor
          </h3>
          <p className={`max-w-md mx-auto ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
            Seleccione un doctor de la lista para ver y gestionar su disponibilidad.
          </p>
        </div>
      )}
    </div>
  );
} 