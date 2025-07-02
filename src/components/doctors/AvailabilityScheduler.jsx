import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

const DAYS_OF_WEEK = [
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' },
  { id: 6, name: 'Sábado' },
  { id: 7, name: 'Domingo' },
];

const TIME_BLOCKS = [
  { id: 'MORNING', name: 'Mañana (8:00 - 12:00)' },
  { id: 'AFTERNOON', name: 'Tarde (14:00 - 18:00)' },
];

/**
 * Componente para gestionar la disponibilidad de los doctores
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.availabilities - Lista de disponibilidades actuales
 * @param {Function} props.onChange - Función a llamar cuando cambia la disponibilidad
 * @param {number} props.doctorId - ID del doctor
 * @param {boolean} props.isLoading - Indica si está cargando
 * @param {boolean} props.isReadOnly - Indica si es de solo lectura
 */
export default function AvailabilityScheduler({ 
  availabilities = [], 
  onChange, 
  doctorId, 
  isLoading = false,
  isReadOnly = false
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Estado para manejar la disponibilidad
  const [schedule, setSchedule] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedSchedule, setLastSavedSchedule] = useState(null);
  
  // Convertir las disponibilidades a un formato más fácil de manejar
  useEffect(() => {
    if (!availabilities || !Array.isArray(availabilities) || availabilities.length === 0) {
      // Crear una estructura vacía si no hay disponibilidades
      const emptySchedule = DAYS_OF_WEEK.map(day => ({
        day_id: day.id,
        day_name: day.name,
        blocks: TIME_BLOCKS.map(block => ({
          block_id: block.id,
          block_name: block.name,
          is_available: false,
          max_patients: 20,
          availability_id: null
        }))
      }));
      setSchedule(emptySchedule);
      setLastSavedSchedule(emptySchedule);
      return;
    }

    // Mapear las disponibilidades existentes
    const mappedSchedule = DAYS_OF_WEEK.map(day => {
      // Buscar bloques para este día
      const dayBlocks = TIME_BLOCKS.map(block => {
        // Buscar si existe esta disponibilidad
        const existingAvailability = availabilities.find(
          a => a.day_of_week === day.id && a.time_block === block.id
        );
        
        return {
          block_id: block.id,
          block_name: block.name,
          is_available: existingAvailability ? existingAvailability.is_available : false,
          max_patients: existingAvailability ? existingAvailability.max_patients : 20,
          availability_id: existingAvailability ? existingAvailability.id : null
        };
      });
      
      return {
        day_id: day.id,
        day_name: day.name,
        blocks: dayBlocks
      };
    });
    
    setSchedule(mappedSchedule);
    setLastSavedSchedule(mappedSchedule);
  }, [availabilities]);

  // Manejar cambio en un bloque
  const handleBlockToggle = async (dayId, blockId) => {
    if (isReadOnly || isSaving) return;
    
    const newSchedule = schedule.map(day => {
      if (day.day_id === dayId) {
        const newBlocks = day.blocks.map(block => {
          if (block.block_id === blockId) {
            return {
              ...block,
              is_available: !block.is_available
            };
          }
          return block;
        });
        
        return {
          ...day,
          blocks: newBlocks
        };
      }
      return day;
    });
    
    setSchedule(newSchedule);
    
    try {
      setIsSaving(true);
      // Notificar cambio
      if (onChange) {
        // Convertir a formato para API
        const apiFormat = convertScheduleToApiFormat(newSchedule, doctorId);
        await onChange(apiFormat);
        setLastSavedSchedule(newSchedule);
        toast.success('Horario actualizado correctamente');
      }
    } catch (error) {
      console.error('Error al guardar horario:', error);
      toast.error('Error al guardar el horario');
      // Revertir cambios si hay error
      setSchedule(lastSavedSchedule);
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar cambio en el número máximo de pacientes
  const handleMaxPatientsChange = async (dayId, blockId, value) => {
    if (isReadOnly || isSaving) return;
    
    // Validar que sea un número entre 1 y 50
    const maxPatients = parseInt(value, 10);
    if (isNaN(maxPatients) || maxPatients < 1 || maxPatients > 50) {
      toast.error('El número máximo de pacientes debe estar entre 1 y 50');
      return;
    }
    
    const newSchedule = schedule.map(day => {
      if (day.day_id === dayId) {
        const newBlocks = day.blocks.map(block => {
          if (block.block_id === blockId) {
            return {
              ...block,
              max_patients: maxPatients
            };
          }
          return block;
        });
        
        return {
          ...day,
          blocks: newBlocks
        };
      }
      return day;
    });
    
    setSchedule(newSchedule);
    
    try {
      setIsSaving(true);
      // Notificar cambio
      if (onChange) {
        // Convertir a formato para API
        const apiFormat = convertScheduleToApiFormat(newSchedule, doctorId);
        await onChange(apiFormat);
        setLastSavedSchedule(newSchedule);
        toast.success('Horario actualizado correctamente');
      }
    } catch (error) {
      console.error('Error al guardar horario:', error);
      toast.error('Error al guardar el horario');
      // Revertir cambios si hay error
      setSchedule(lastSavedSchedule);
    } finally {
      setIsSaving(false);
    }
  };

  // Convertir el schedule a formato para API
  const convertScheduleToApiFormat = (scheduleData, doctorId) => {
    const result = [];
    
    scheduleData.forEach(day => {
      day.blocks.forEach(block => {
        if (block.is_available) {
          result.push({
            id: block.availability_id, // null si es nuevo
            doctor: doctorId,
            day_of_week: day.day_id,
            time_block: block.block_id,
            max_patients: block.max_patients,
            is_available: true
          });
        } else if (block.availability_id) {
          // Si existe pero ahora está desactivado
          result.push({
            id: block.availability_id,
            doctor: doctorId,
            day_of_week: day.day_id,
            time_block: block.block_id,
            max_patients: block.max_patients,
            is_available: false
          });
        }
      });
    });
    
    return result;
  };

  return (
    <div className={`${isDark ? 'bg-neutral-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-neutral-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`${isDark ? 'bg-neutral-900' : 'bg-gray-50'} px-4 py-3 border-b ${isDark ? 'border-neutral-700' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Horario de Disponibilidad
        </h3>
        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
          Configure los días y horarios en que el doctor estará disponible
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="w-8 h-8 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          <p className={`ml-3 text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
            Cargando horarios...
          </p>
        </div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule.map(day => (
              <div 
                key={day.day_id}
                className={`border rounded-lg p-4 ${isDark ? 'border-neutral-700' : 'border-gray-200'}`}
              >
                <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {day.day_name}
                </h4>
                
                <div className="space-y-3">
                  {day.blocks.map(block => (
                    <div 
                      key={`${day.day_id}-${block.block_id}`}
                      className={`flex flex-col p-3 rounded-lg ${
                        block.is_available 
                          ? isDark 
                            ? 'bg-green-900/20 border border-green-700/30' 
                            : 'bg-green-50 border border-green-200' 
                          : isDark 
                            ? 'bg-neutral-800 border border-neutral-700' 
                            : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {block.block_name}
                        </span>
                        
                        <button 
                          type="button"
                          onClick={() => handleBlockToggle(day.day_id, block.block_id)}
                          disabled={isReadOnly}
                          className={`p-1 rounded-full ${
                            isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'
                          } ${
                            block.is_available
                              ? isDark 
                                ? 'text-green-400 hover:bg-green-800/30' 
                                : 'text-green-600 hover:bg-green-100'
                              : isDark 
                                ? 'text-neutral-400 hover:bg-neutral-700' 
                                : 'text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {block.is_available ? (
                            <CheckCircleIcon className="w-5 h-5" />
                          ) : (
                            <XCircleIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      
                      {block.is_available && (
                        <div className="mt-2">
                          <label 
                            htmlFor={`max-patients-${day.day_id}-${block.block_id}`}
                            className={`block text-xs mb-1 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}
                          >
                            Máximo de pacientes:
                          </label>
                          <input
                            type="number"
                            id={`max-patients-${day.day_id}-${block.block_id}`}
                            min="1"
                            max="50"
                            value={block.max_patients}
                            onChange={(e) => handleMaxPatientsChange(day.day_id, block.block_id, e.target.value)}
                            disabled={isReadOnly}
                            className={`w-full px-3 py-2 rounded-md text-sm ${
                              isDark 
                                ? 'bg-neutral-700 border-neutral-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } border ${
                              isReadOnly ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center">
            <div className="flex items-center mr-4">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                isDark ? 'bg-green-900/50 border border-green-700/30' : 'bg-green-100'
              }`}></span>
              <span className={`text-xs ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                Disponible
              </span>
            </div>
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-gray-100'
              }`}></span>
              <span className={`text-xs ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                No disponible
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 