import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useGetDoctorById } from '../../hooks/useDoctors';
import { useGetDoctorAvailability, useManageAvailabilities } from '../../hooks/useAvailability';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  CalendarDaysIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import AvailabilityScheduler from '../../components/doctors/AvailabilityScheduler';

export default function DoctorSchedulePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados
  const [availabilities, setAvailabilities] = useState([]);
  
  // Obtener datos del doctor
  const { 
    data: doctor, 
    isLoading: loadingDoctor, 
    isError: doctorError,
    error: doctorErrorData
  } = useGetDoctorById(id);
  
  // Obtener disponibilidades del doctor
  const {
    data: doctorAvailabilities,
    isLoading: loadingAvailabilities,
    refetch: refetchAvailabilities,
  } = useGetDoctorAvailability(id);
  
  // Mutación para actualizar disponibilidades
  const { updateMultiple, isPending } = useManageAvailabilities();
  
  // Manejar cambios en la disponibilidad
  const handleAvailabilityChange = (updatedAvailabilities) => {
    console.log('🔄 Nuevas disponibilidades:', updatedAvailabilities);
    setAvailabilities(updatedAvailabilities);
  };
  
  // Guardar cambios
  const handleSaveChanges = async () => {
    if (!id || !availabilities.length) {
      toast.warning('No hay cambios en los horarios para guardar.');
      return;
    }
    
    try {
      await updateMultiple(parseInt(id, 10), availabilities);
    } catch (error) {
      console.error('❌ Error al guardar disponibilidades:', error);
      // El toast de error ya se maneja en el hook
    }
  };
  
  useEffect(() => {
    if (id) {
      refetchAvailabilities();
    }
  }, [id, refetchAvailabilities]);
  
  // Volver a la página de visualización de disponibilidad
  const handleGoBack = () => {
    navigate(`/doctors/availability/${id}`);
  };
  
  // Mostrar pantalla de carga
  if (loadingDoctor || !doctor) {
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
  if (doctorError) {
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
                  Horario del Doctor
                </h1>
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
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isPending}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                isDark 
                  ? 'bg-primary-600 hover:bg-primary-700 text-white border-primary-700' 
                  : 'bg-primary-600 hover:bg-primary-700 text-white border-primary-600'
              } ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <CalendarDaysIcon className="w-4 h-4 mr-2" />
                  Guardar Horarios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="space-y-6">
        <AvailabilityScheduler 
          availabilities={Array.isArray(doctorAvailabilities?.results) ? doctorAvailabilities.results : []}
          onChange={handleAvailabilityChange}
          doctorId={parseInt(id, 10)}
          isLoading={loadingAvailabilities}
        />
        
        <div className={`p-4 rounded-lg border ${isDark ? 'border-amber-700/50 bg-amber-900/20' : 'border-amber-200 bg-amber-50'}`}>
          <div className="flex">
            <ExclamationTriangleIcon className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <div className="ml-3">
              <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                Recuerde que debe guardar los cambios para que se apliquen. Los horarios marcados como disponibles serán visibles para los pacientes al agendar citas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 