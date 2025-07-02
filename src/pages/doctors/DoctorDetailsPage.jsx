import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useGetDoctorById } from '../../hooks/useDoctors';
import { useGetDoctorAvailability } from '../../hooks/useAvailability';
import { useMedicalSpecialties } from '../../hooks/useMedicalSpecialties';
import { 
  ArrowLeftIcon, 
  UserIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import DoctorAvailabilityViewer from '../../components/doctors/DoctorAvailabilityViewer';

export default function DoctorDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Obtener datos del doctor
  const { 
    data: doctor, 
    isLoading: loadingDoctor, 
    error: doctorError
  } = useGetDoctorById(id);
  
  // Obtener disponibilidades del doctor
  const {
    data: availabilityData,
    isLoading: loadingAvailabilities,
  } = useGetDoctorAvailability(id);
  
  // Obtener todas las especialidades para poder mostrar detalles
  const { specialties: allSpecialties, isLoading: loadingSpecialties } = useMedicalSpecialties();
  
  // Estado para almacenar especialidades procesadas
  const [processedSpecialties, setProcessedSpecialties] = useState([]);
  
  // Procesar especialidades del doctor
  useEffect(() => {
    if (doctor?.specialties && allSpecialties?.results) {
      const doctorSpecialties = doctor.specialties;
      const allSpecsMap = new Map(
        allSpecialties.results.map(spec => [spec.id, spec])
      );
      
      // Procesar y enriquecer las especialidades del doctor
      const processed = doctorSpecialties.map(spec => {
        // Puede ser un objeto o simplemente un ID
        const specId = typeof spec === 'object' ? spec.id : spec;
        const fullSpecData = allSpecsMap.get(specId);
        
        if (fullSpecData) {
          return {
            ...fullSpecData,
            is_primary: spec.is_primary || false
          };
        }
        
        // Si no tenemos datos completos, devolver lo que tenemos
        return typeof spec === 'object' ? spec : { id: spec, name: `Especialidad ${spec}` };
      });
      
      setProcessedSpecialties(processed);
    }
  }, [doctor, allSpecialties]);
  
  // Volver a la lista de doctores
  const handleGoBack = () => {
    navigate('/doctors');
  };
  
  // Ir a la página de edición
  const handleEdit = () => {
    navigate(`/doctors/edit/${id}`);
  };
  
  // Ir a la página de horarios
  const handleManageSchedule = () => {
    navigate(`/doctors/schedule/${id}`);
  };
  
  // Mostrar pantalla de carga
  if (loadingDoctor) {
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
          <XCircleIcon className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          <div className="ml-3">
            <h3 className={`text-lg font-medium ${isDark ? 'text-red-400' : 'text-red-800'}`}>
              Error al cargar el doctor
            </h3>
            <p className={`mt-2 text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
              No se pudo cargar la información del doctor
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
  
  if (!doctor) {
    return (
      <div className={`rounded-lg p-6 ${isDark ? 'bg-yellow-900/20 border border-yellow-700/30' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-start">
          <XCircleIcon className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
          <div className="ml-3">
            <h3 className={`text-lg font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>
              Doctor no encontrado
            </h3>
            <p className={`mt-2 text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
              No se encontró el doctor con ID {id}
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
      {/* Encabezado con botones de acción */}
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
                  {doctor.full_name || `${doctor.first_name} ${doctor.last_name}`}
                </h1>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    doctor.doctor_type === 'PRIMARY' 
                      ? isDark ? 'bg-green-900/20 text-green-400 border border-green-700/30' : 'bg-green-100 text-green-800' 
                      : isDark ? 'bg-blue-900/20 text-blue-400 border border-blue-700/30' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {doctor.doctor_type === 'PRIMARY' ? 'Médico General' : 'Especialista'}
                  </span>
                  
                  <span className={`mx-2 text-xs ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>•</span>
                  
                  <span className={`text-xs ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                    CMP: {doctor.cmp_number}
                  </span>
                  
                  <span className={`mx-2 text-xs ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>•</span>
                  
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    doctor.is_active 
                      ? isDark ? 'bg-green-900/20 text-green-400 border border-green-700/30' : 'bg-green-100 text-green-800' 
                      : isDark ? 'bg-red-900/20 text-red-400 border border-red-700/30' : 'bg-red-100 text-red-800'
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
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleManageSchedule}
                className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium ${
                  isDark 
                    ? 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Gestionar Horarios
              </button>
              
              <button
                type="button"
                onClick={handleEdit}
                className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium ${
                  isDark 
                    ? 'bg-primary-600 hover:bg-primary-700 text-white border-primary-700' 
                    : 'bg-primary-600 hover:bg-primary-700 text-white border-primary-600'
                }`}
              >
                Editar Doctor
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Grid de información y horarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Información personal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <div className={`rounded-lg shadow-sm border ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}`}>
            <div className={`border-b ${isDark ? 'border-neutral-700' : 'border-gray-200'} p-4`}>
              <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Información del Doctor
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Datos personales */}
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-3`}>
                  Datos Personales
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <UserIcon className={`w-5 h-5 mt-0.5 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`} />
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>
                        Nombre Completo
                      </p>
                      <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                        {doctor.full_name || `${doctor.first_name} ${doctor.last_name}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <EnvelopeIcon className={`w-5 h-5 mt-0.5 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`} />
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>
                        Correo Electrónico
                      </p>
                      <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                        {doctor.email || doctor.user?.email || 'No especificado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <PhoneIcon className={`w-5 h-5 mt-0.5 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`} />
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>
                        Teléfono
                      </p>
                      <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                        {doctor.phone || 'No especificado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <BuildingOfficeIcon className={`w-5 h-5 mt-0.5 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`} />
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>
                        Consultorio
                      </p>
                      <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                        {doctor.consultation_room || 'No asignado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Especialidades */}
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-gray-700'} mb-3 flex items-center`}>
                  <AcademicCapIcon className={`w-5 h-5 mr-1 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`} />
                  Especialidades
                </h3>
                
                {loadingSpecialties ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="w-6 h-6 border-2 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
                    <p className={`ml-3 text-xs ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                      Cargando especialidades...
                    </p>
                  </div>
                ) : processedSpecialties.length === 0 ? (
                  <div className={`rounded-lg border p-4 ${isDark ? 'border-neutral-700 bg-neutral-800/50' : 'border-gray-200 bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                      No se han asignado especialidades a este doctor.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {processedSpecialties.map(specialty => (
                      <div 
                        key={specialty.id}
                        className={`rounded-lg border p-3 ${
                          isDark 
                            ? specialty.is_primary 
                              ? 'border-blue-700 bg-blue-900/20' 
                              : 'border-neutral-700 bg-neutral-800/50'
                            : specialty.is_primary 
                              ? 'border-blue-200 bg-blue-50' 
                              : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <p className={`text-sm font-medium ${
                          isDark 
                            ? specialty.is_primary ? 'text-blue-400' : 'text-neutral-300'
                            : specialty.is_primary ? 'text-blue-800' : 'text-gray-700'
                        }`}>
                          {specialty.name}
                          {specialty.is_primary && (
                            <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                              isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                            }`}>
                              Principal
                            </span>
                          )}
                        </p>
                        {specialty.description && (
                          <p className={`mt-1 text-xs ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                            {specialty.description.substring(0, 100)}
                            {specialty.description.length > 100 && '...'}
                          </p>
                        )}
                        {specialty.consultation_price && (
                          <p className={`mt-2 text-xs ${
                            isDark ? 'text-neutral-300' : 'text-gray-600'
                          }`}>
                            Precio consulta: S/ {specialty.consultation_price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Columna derecha: Horarios */}
        <div className="lg:col-span-1">
          {loadingAvailabilities ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-2 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
              <p className={`ml-3 text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                Cargando horarios...
              </p>
            </div>
          ) : (
            <DoctorAvailabilityViewer 
              availabilities={availabilityData?.results || []}
              doctorName={doctor.full_name || `${doctor.first_name} ${doctor.last_name}`}
            />
          )}
        </div>
      </div>
    </div>
  );
} 