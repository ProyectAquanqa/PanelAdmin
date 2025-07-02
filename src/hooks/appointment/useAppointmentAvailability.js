import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminApiClient } from '../../api';
import { getTimeBlockDisplayName } from '../../services/appointment';

/**
 * Hook para manejar la disponibilidad de horarios para citas
 * @param {number|string} doctorId - ID del doctor seleccionado
 * @param {string} date - Fecha seleccionada
 * @returns {Object} Estado y funciones relacionadas con la disponibilidad
 */
export const useAppointmentAvailability = (doctorId, date) => {
  const [availableTimeBlocks, setAvailableTimeBlocks] = useState([]);
  const [loadingTimeBlocks, setLoadingTimeBlocks] = useState(false);
  const [availabilityInfo, setAvailabilityInfo] = useState(null);

  // Función para obtener los bloques horarios disponibles
  const fetchAvailableTimeBlocks = async () => {
    if (!doctorId || !date) {
      setAvailableTimeBlocks([]);
      setAvailabilityInfo(null);
      return;
    }
    
    setLoadingTimeBlocks(true);
    setAvailabilityInfo(null); // Limpiar info anterior
    
    try {
      console.log(`🕐 Obteniendo bloques horarios para doctor ${doctorId} en fecha ${date}...`);
      
      // Calcular día de la semana
      const dateObj = new Date(date + 'T00:00:00'); // Evitar problemas de zona horaria
      const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay(); // Convertir domingo (0) a 7
      const dayNames = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      
      // Parámetros para la API
      const params = {
        doctor_id: doctorId,
        date: date
      };
      
      const response = await adminApiClient.get('/api/appointments/available-time-blocks/', {
        params: params
      });
      
      console.log('✅ Respuesta de bloques horarios:', response.data);
      
      let timeBlocks = [];
      let availabilityDetails = null;
      
      if (response.data && Array.isArray(response.data.time_blocks)) {
        // ✅ CORRECCIÓN: Procesar la nueva respuesta con detalles de cupos.
        timeBlocks = response.data.time_blocks.map(block => ({
          id: block.id,
          name: block.name,
          available_slots: block.available_slots,
          total_slots: block.total_slots,
        }));
        
        availabilityDetails = {
          day_name: dayNames[dayOfWeek],
          total_blocks: response.data.total_blocks,
          available_blocks_count: response.data.available_blocks_count,
        };
      } else {
        console.log('⚠️ Respuesta no contiene time_blocks válidos:', response.data);
        
        availabilityDetails = {
          doctor_id: doctorId,
          date: date,
          day_name: dayNames[dayOfWeek],
          message: response.data?.message || 'Sin información disponible'
        };
      }
      
      // Mensajes más informativos según el caso
      if (timeBlocks.length === 0) {
        const message = response.data?.message || 'No se encontraron horarios específicos disponibles';
        console.log(`❌ ${message}`);
        
        if (response.data?.message?.includes('no tiene horarios definidos')) {
          toast.error(`El doctor no atiende los ${dayNames[dayOfWeek]}s. Seleccione otra fecha.`, {
            duration: 4000
          });
        } else if (response.data?.message?.includes('fechas pasadas')) {
          toast.error(`❌ Error de fecha: ${response.data.message}. Verifique la fecha seleccionada.`, {
            duration: 4000
          });
        } else if (response.data?.total_blocks > 0 && response.data?.available_blocks_count === 0) {
          toast.warning(`⚠️ Todos los horarios están ocupados para ${dayNames[dayOfWeek]} ${date}. Pruebe con otra fecha.`, {
            duration: 5000
          });
        } else {
          toast.error(`No hay horarios disponibles para ${dayNames[dayOfWeek]} ${date}. Pruebe con otra fecha.`, {
            duration: 4000
          });
        }
      }
      
      setAvailableTimeBlocks(timeBlocks);
      setAvailabilityInfo(availabilityDetails);
      return timeBlocks;
    } catch (error) {
      console.error('❌ Error al obtener bloques horarios:', error);
      
      if (error.response?.status === 400) {
        const errorMsg = error.response.data?.error || 'Error en los parámetros enviados';
        toast.error(`Error 400: ${errorMsg}`, { duration: 4000 });
      } else if (error.response?.status === 404) {
        toast.error('Endpoint no encontrado. Verifique la configuración del servidor.', { duration: 4000 });
      } else {
        toast.error('Error al cargar horarios. Verifique la fecha seleccionada.', { duration: 4000 });
      }
      
      // En caso de error, limpiar todo
      setAvailableTimeBlocks([]);
      setAvailabilityInfo(null);
      return [];
    } finally {
      setLoadingTimeBlocks(false);
    }
  };

  // Efecto para cargar bloques horarios cuando cambia el doctor o la fecha
  useEffect(() => {
    fetchAvailableTimeBlocks();
  }, [doctorId, date]);

  // Función para refrescar la disponibilidad manualmente
  const refreshAvailability = () => {
    fetchAvailableTimeBlocks();
  };

  return {
    availableTimeBlocks,
    loadingTimeBlocks,
    availabilityInfo,
    refreshAvailability
  };
}; 