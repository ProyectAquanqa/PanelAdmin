import apiClient from '../api/apiClient';
import { API_ROUTES } from '../config/api';

/**
 * Obtiene la lista de citas
 * @param {Object} params - Parámetros para filtrar la lista
 * @returns {Promise} Promise con la respuesta
 */
export const getAppointments = async (params = {}) => {
  try {
    console.log('🔍 Solicitando citas con parámetros:', params);
    
    // Intentar primero con la ruta principal
    try {
      const response = await apiClient.get(API_ROUTES.APPOINTMENTS, { params });
      console.log('✅ Citas obtenidas (ruta principal):', response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status !== 404) {
        throw error;
      }
      
      // Si falla con 404, intentar con rutas alternativas
      console.log('⚠️ Ruta principal no disponible, intentando alternativas');
      
      const alternativeUrls = [
        '/api/appointments/api/appointments/',
        '/api/appointments/api/',
        '/api/appointments/'
      ];
      
      for (const url of alternativeUrls) {
        try {
          const response = await apiClient.get(url, { params });
          console.log(`✅ Citas obtenidas (ruta alternativa ${url}):`, response.data);
          return response.data;
        } catch (altError) {
          if (altError.response?.status !== 404) {
            throw altError;
          }
          // Continuar con la siguiente URL si es 404
        }
      }
      
      // Si llegamos aquí, ninguna URL funcionó
      throw new Error('No se pudo obtener la lista de citas. Todas las rutas fallaron.');
    }
  } catch (error) {
    console.error('💥 Error al obtener citas:', error.response || error);
    throw error;
  }
};

/**
 * Obtiene las citas del día de hoy
 * @returns {Promise} Promise con la respuesta
 */
export const getTodayAppointments = async () => {
  try {
    const url = API_ROUTES.APPOINTMENT_ENDPOINTS.TODAY;
    const response = await apiClient.get(url);
    console.log('Citas de hoy:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener citas de hoy:', error.response || error);
    throw error;
  }
};

/**
 * Obtiene las citas próximas
 * @returns {Promise} Promise con la respuesta
 */
export const getUpcomingAppointments = async () => {
  try {
    const url = API_ROUTES.APPOINTMENT_ENDPOINTS.UPCOMING;
    const response = await apiClient.get(url);
    console.log('Citas próximas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener citas próximas:', error.response || error);
    throw error;
  }
};

/**
 * Obtiene una cita por su ID
 * @param {number} id - ID de la cita
 * @returns {Promise} Promise con la respuesta
 */
export const getAppointmentById = async (id) => {
  try {
    console.log(`Solicitando cita con ID: ${id}`);
    const url = `${API_ROUTES.APPOINTMENTS}${id}/`;
    const response = await apiClient.get(url);
    console.log(`Respuesta de la cita ${id}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la cita con ID ${id}:`, error.response || error);
    throw error;
  }
};

/**
 * Obtiene los horarios disponibles para una cita
 * @param {Object} params - Parámetros para buscar horarios disponibles
 * @returns {Promise} Promise con la respuesta
 */
export const getAvailableSlots = async (params) => {
  try {
    console.log('Buscando horarios disponibles con parámetros:', params);
    
    // Verificar que tenemos los parámetros necesarios
    if (!params.doctor_id || !params.date) {
      console.error('Error: Faltan parámetros requeridos para buscar horarios disponibles', params);
      throw new Error('Se requiere doctor_id y date para buscar horarios disponibles');
    }
    
    // Intentar primero con la ruta principal
    try {
      const response = await apiClient.get(API_ROUTES.APPOINTMENT_ENDPOINTS.AVAILABLE_TIME_BLOCKS, { params });
      console.log(`✅ Horarios disponibles obtenidos:`, response.data);
      
      // Adaptar la respuesta al formato esperado por el componente
      const result = {
        doctor_id: params.doctor_id,
        date: params.date,
        available_blocks: response.data?.time_blocks || response.data?.available_blocks || [],
        busy_blocks: response.data?.busy_blocks || []
      };
      
      return result;
    } catch (error) {
      if (error.response?.status !== 404) {
        throw error;
      }
      
      // Si falla con 404, intentar con rutas alternativas
      console.log('⚠️ Ruta principal no disponible, intentando alternativas');
      
      const alternativeUrls = [
        '/api/appointments/api/available-time-blocks/',
        '/api/appointments/api/available-slots/',
        '/api/appointments/available-slots/'
      ];
      
      for (const url of alternativeUrls) {
        try {
          const response = await apiClient.get(url, { params });
          console.log(`✅ Horarios disponibles obtenidos (ruta alternativa ${url}):`, response.data);
          
          // Adaptar la respuesta al formato esperado por el componente
          const result = {
            doctor_id: params.doctor_id,
            date: params.date,
            available_blocks: response.data?.time_blocks || response.data?.available_blocks || [],
            busy_blocks: response.data?.busy_blocks || []
          };
          
          return result;
        } catch (altError) {
          if (altError.response?.status !== 404) {
            throw altError;
          }
          // Continuar con la siguiente URL si es 404
        }
      }
      
      // Si llegamos aquí, ninguna URL funcionó, devolver valores por defecto
      console.log('⚠️ Todas las rutas fallaron, devolviendo valores por defecto');
      return {
        doctor_id: params.doctor_id,
        date: params.date,
        available_blocks: ['MORNING', 'AFTERNOON'],
        busy_blocks: []
      };
    }
  } catch (error) {
    console.error('💥 Error al obtener horarios disponibles:', error.response?.data || error);
    // En caso de error, devolver un objeto con valores por defecto
    return {
      doctor_id: params.doctor_id,
      date: params.date,
      available_blocks: ['MORNING', 'AFTERNOON'],
      busy_blocks: []
    };
  }
};

/**
 * Obtiene doctores por especialidad
 * @param {number} specialtyId - ID de la especialidad
 * @returns {Promise} Promise con la respuesta
 */
export const getDoctorsBySpecialty = async (specialtyId) => {
  try {
    console.log(`Solicitando doctores para especialidad ID: ${specialtyId}`);
    
    // Intentar primero con la ruta principal
    try {
      const response = await apiClient.get(API_ROUTES.APPOINTMENT_ENDPOINTS.DOCTORS_BY_SPECIALTY, {
        params: { specialty_id: specialtyId }
      });
      
      console.log(`✅ Doctores obtenidos (ruta principal):`, response.data);
      
      // Procesar la respuesta según el formato
      let doctorsList = [];
      
      if (response.data && response.data.doctors) {
        doctorsList = response.data.doctors;
      } else if (Array.isArray(response.data)) {
        doctorsList = response.data;
      } else if (response.data && response.data.results) {
        doctorsList = response.data.results;
      } else {
        doctorsList = []; // Por defecto, lista vacía
      }
      
      console.log(`Doctores procesados: ${doctorsList.length}`);
      return doctorsList;
    } catch (error) {
      if (error.response?.status !== 404) {
        throw error;
      }
      
      // Si falla con 404, intentar con rutas alternativas
      console.log('⚠️ Ruta principal no disponible, intentando alternativas');
      
      const alternativeUrls = [
        '/api/appointments/api/doctors-by-specialty/',
        '/api/doctors/api/by-specialty/',
        '/api/doctors/by-specialty/'
      ];
      
      for (const url of alternativeUrls) {
        try {
          const response = await apiClient.get(url, {
            params: { specialty_id: specialtyId }
          });
          
          console.log(`✅ Doctores obtenidos (ruta alternativa ${url}):`, response.data);
          
          // Procesar la respuesta según el formato
          let doctorsList = [];
          
          if (response.data && response.data.doctors) {
            doctorsList = response.data.doctors;
          } else if (Array.isArray(response.data)) {
            doctorsList = response.data;
          } else if (response.data && response.data.results) {
            doctorsList = response.data.results;
          } else {
            doctorsList = []; // Por defecto, lista vacía
          }
          
          console.log(`Doctores procesados: ${doctorsList.length}`);
          return doctorsList;
        } catch (altError) {
          if (altError.response?.status !== 404) {
            throw altError;
          }
          // Continuar con la siguiente URL si es 404
        }
      }
      
      // Si llegamos aquí, ninguna URL funcionó
      console.log('⚠️ Todas las rutas fallaron, devolviendo lista vacía');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener doctores por especialidad:', error.response || error);
    return [];
  }
};

/**
 * Crea una nueva cita
 * @param {Object} appointmentData - Datos de la cita a crear
 * @returns {Promise} Promise con la respuesta
 */
export const createAppointment = async (appointmentData) => {
  try {
    console.log('Creando cita con datos:', appointmentData);
    
    // Verificar que los datos sean correctos
    if (!appointmentData.patient || !appointmentData.doctor || !appointmentData.specialty) {
      console.error('Error: Faltan datos requeridos', {
        patient: appointmentData.patient,
        doctor: appointmentData.doctor,
        specialty: appointmentData.specialty
      });
      throw new Error('Faltan datos requeridos para crear la cita');
    }
    
    // Asegurar que los IDs sean números
    const data = {
      ...appointmentData,
      patient: Number(appointmentData.patient),
      doctor: Number(appointmentData.doctor),
      specialty: Number(appointmentData.specialty),
    };
    
    console.log('Datos procesados para enviar:', data);
    
    // Intentar primero con la ruta principal
    try {
      const response = await apiClient.post(API_ROUTES.APPOINTMENTS, data);
      console.log(`✅ Cita creada exitosamente (ruta principal):`, response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status !== 404) {
        // Si hay errores de validación, mostrarlos detalladamente
        if (error.response?.data) {
          console.error('Errores de validación:', error.response.data);
        }
        throw error;
      }
      
      // Si falla con 404, intentar con rutas alternativas
      console.log('⚠️ Ruta principal no disponible, intentando alternativas');
      
      const alternativeUrls = [
        '/api/appointments/api/appointments/',
        '/api/appointments/appointments/',
        '/api/appointments/api/'
      ];
      
      for (const url of alternativeUrls) {
        try {
          const response = await apiClient.post(url, data);
          console.log(`✅ Cita creada exitosamente (ruta alternativa ${url}):`, response.data);
          return response.data;
        } catch (altError) {
          if (altError.response?.status !== 404) {
            // Si hay errores de validación, mostrarlos detalladamente
            if (altError.response?.data) {
              console.error('Errores de validación:', altError.response.data);
            }
            throw altError;
          }
          // Continuar con la siguiente URL si es 404
        }
      }
      
      // Si llegamos aquí, ninguna URL funcionó
      throw new Error('No se pudo crear la cita. Todas las rutas fallaron.');
    }
  } catch (error) {
    console.error('Error al crear cita:', error.response?.data || error);
    throw error;
  }
};

/**
 * Actualiza una cita existente
 * @param {number} id - ID de la cita a actualizar
 * @param {Object} appointmentData - Datos actualizados de la cita
 * @returns {Promise} Promise con la respuesta
 */
export const updateAppointment = async (id, appointmentData) => {
  try {
    console.log(`Actualizando cita ${id} con datos:`, appointmentData);
    
    // Asegurar que los IDs sean números
    const data = {
      ...appointmentData,
      patient: Number(appointmentData.patient),
      doctor: Number(appointmentData.doctor),
      specialty: Number(appointmentData.specialty),
    };
    
    const url = `${API_ROUTES.APPOINTMENTS}${id}/`;
    const response = await apiClient.put(url, data);
    console.log(`Cita ${id} actualizada exitosamente:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar cita ${id}:`, error.response || error);
    throw error;
  }
};

/**
 * Cancela una cita
 * @param {number} id - ID de la cita a cancelar
 * @param {Object} cancelData - Datos para la cancelación
 * @returns {Promise} Promise con la respuesta
 */
export const cancelAppointment = async (id, cancelData = {}) => {
  try {
    console.log(`Cancelando cita ${id} con datos:`, cancelData);
    const url = API_ROUTES.APPOINTMENT_ENDPOINTS.CANCEL(id);
    const response = await apiClient.post(url, cancelData);
    console.log(`Cita ${id} cancelada exitosamente:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al cancelar cita ${id}:`, error.response || error);
    throw error;
  }
};

/**
 * Reprograma una cita
 * @param {number} id - ID de la cita
 * @param {Object} rescheduleData - Datos para la reprogramación
 * @returns {Promise} Promise con la respuesta
 */
export const rescheduleAppointment = async (id, rescheduleData) => {
  try {
    console.log(`Reprogramando cita con ID: ${id}`, rescheduleData);
    
    // Asegurar el formato correcto de la fecha
    if (rescheduleData.new_date && typeof rescheduleData.new_date === 'string') {
      // Si la fecha está en formato DD/MM/YYYY, convertir a YYYY-MM-DD
      if (rescheduleData.new_date.includes('/')) {
        const parts = rescheduleData.new_date.split('/');
        if (parts.length === 3) {
          rescheduleData.new_date = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
    }
    
    const url = `/api/appointments/api/${id}/reschedule/`;
    const response = await apiClient.post(url, rescheduleData);
    console.log(`Cita ${id} reprogramada:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al reprogramar la cita con ID ${id}:`, error.response || error);
    throw error;
  }
};

/**
 * Marca una cita como completada
 * @param {number} id - ID de la cita
 * @returns {Promise} Promise con la respuesta
 */
export const completeAppointment = async (id) => {
  try {
    console.log(`Marcando cita ${id} como completada`);
    const url = API_ROUTES.APPOINTMENT_ENDPOINTS.COMPLETE(id);
    const response = await apiClient.post(url);
    console.log(`Cita ${id} marcada como completada:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al marcar cita ${id} como completada:`, error.response || error);
    throw error;
  }
};

/**
 * Marca una cita como "no se presentó"
 * @param {number} id - ID de la cita
 * @returns {Promise} Promise con la respuesta
 */
export const markNoShow = async (id) => {
  try {
    console.log(`Marcando cita ${id} como "no se presentó"`);
    const url = API_ROUTES.APPOINTMENT_ENDPOINTS.NO_SHOW(id);
    const response = await apiClient.post(url);
    console.log(`Cita ${id} marcada como "no se presentó":`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al marcar cita ${id} como "no se presentó":`, error.response || error);
    throw error;
  }
}; 