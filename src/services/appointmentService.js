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
    
    // URLs a probar en orden de prioridad para citas
    const urlsToTry = [
      '/api/appointments/api/appointments/',
      '/api/appointments/api/appointments',
      '/api/appointments/api/',
      '/api/appointments/appointments/'
    ];
    
    console.log('🎯 URLs que vamos a probar:', urlsToTry);
    
    for (const url of urlsToTry) {
      try {
        console.log(`🚀 Probando URL: ${url}`);
        const response = await apiClient.get(url, { params });
        console.log(`✅ ÉXITO con URL: ${url}`, response.data);
        return response.data;
      } catch (error) {
        console.log(`❌ Falló URL: ${url} - Status: ${error.response?.status}`);
        if (error.response?.status !== 404) {
          // Si no es 404, entonces hay otro problema (500, 403, etc.)
          throw error;
        }
        // Si es 404, continúa con la siguiente URL
      }
    }
    
    // Si llegamos aquí, ninguna URL funcionó
    throw new Error('Ninguna URL de citas está disponible. Verifica que el backend esté correctamente configurado.');
    
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
    const url = `${API_ROUTES.APPOINTMENTS}/today/`;
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
    const url = `${API_ROUTES.APPOINTMENTS}/upcoming/`;
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
    const url = `${API_ROUTES.APPOINTMENTS}/${id}/`;
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
    
    // URLs a probar en orden de prioridad para obtener horarios disponibles
    const urlsToTry = [
      '/api/appointments/api/available-slots/',
      '/api/appointments/available-slots/',
      '/api/appointments/api/availability/'
    ];
    
    console.log('🎯 URLs que vamos a probar para horarios disponibles:', urlsToTry);
    
    let lastError = null;
    
    for (const url of urlsToTry) {
      try {
        console.log(`🚀 Probando URL para horarios disponibles: ${url}`);
        
        // Intentar primero con POST
        try {
          const response = await apiClient.post(url, params);
          console.log(`✅ Horarios disponibles obtenidos con POST a ${url}:`, response.data);
          return response.data;
        } catch (postError) {
          console.log(`❌ Falló POST a ${url}, intentando con GET`);
          
          // Si falla POST, intentar con GET y parámetros de consulta
          const response = await apiClient.get(url, { params });
          console.log(`✅ Horarios disponibles obtenidos con GET a ${url}:`, response.data);
          return response.data;
        }
      } catch (error) {
        lastError = error;
        console.log(`❌ Falló URL: ${url} - Status: ${error.response?.status}`);
        console.log('Error detallado:', error.response?.data || error.message);
        
        if (error.response?.status !== 404) {
          // Si no es 404, entonces hay otro problema (500, 403, etc.)
          throw error;
        }
        // Si es 404, continúa con la siguiente URL
      }
    }
    
    // Si llegamos aquí, ninguna URL funcionó
    throw lastError || new Error('No se pudieron obtener los horarios disponibles. Verifica la configuración del backend.');
    
  } catch (error) {
    console.error('💥 Error al obtener horarios disponibles:', error.response?.data || error);
    throw error;
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
    
    // URLs a probar en orden de prioridad para obtener doctores por especialidad
    const urlsToTry = [
      '/api/appointments/api/doctors-by-specialty/',
      '/api/doctors/api/by-specialty/',
      '/api/appointments/doctors-by-specialty/'
    ];
    
    console.log('🎯 URLs que vamos a probar para doctores por especialidad:', urlsToTry);
    
    for (const url of urlsToTry) {
      try {
        console.log(`🚀 Probando URL: ${url}`);
        const response = await apiClient.get(url, { 
          params: { specialty_id: specialtyId } 
        });
        
        console.log(`✅ ÉXITO con URL: ${url}`, response.data);
        
        // Si la respuesta tiene un formato específico con doctors, devolver solo los doctores
        if (response.data && response.data.doctors) {
          console.log('Doctores encontrados:', response.data.doctors.length);
          return response.data.doctors;
        }
        
        // Si la respuesta es un array directo, devolverlo
        if (Array.isArray(response.data)) {
          console.log('Doctores encontrados (array):', response.data.length);
          return response.data;
        }
        
        // Si la respuesta tiene results, devolver results
        if (response.data && response.data.results) {
          console.log('Doctores encontrados (results):', response.data.results.length);
          return response.data.results;
        }
        
        // Por defecto, devolver la respuesta completa
        return response.data;
      } catch (error) {
        console.log(`❌ Falló URL: ${url} - Status: ${error.response?.status}`);
        if (error.response?.status !== 404) {
          // Si no es 404, entonces hay otro problema (500, 403, etc.)
          throw error;
        }
        // Si es 404, continúa con la siguiente URL
      }
    }
    
    // Si llegamos aquí, ninguna URL funcionó
    throw new Error('No se pudo obtener la lista de doctores por especialidad. Verifica la configuración del backend.');
  } catch (error) {
    console.error('Error al obtener doctores por especialidad:', error.response || error);
    throw error;
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
    appointmentData.patient = Number(appointmentData.patient);
    appointmentData.doctor = Number(appointmentData.doctor);
    appointmentData.specialty = Number(appointmentData.specialty);
    
    // Asegurar el formato correcto de la fecha y hora
    if (appointmentData.appointment_date && typeof appointmentData.appointment_date === 'string') {
      // Si la fecha está en formato DD/MM/YYYY, convertir a YYYY-MM-DD
      if (appointmentData.appointment_date.includes('/')) {
        const parts = appointmentData.appointment_date.split('/');
        if (parts.length === 3) {
          appointmentData.appointment_date = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
    }
    
    // URLs a probar en orden de prioridad para crear citas
    const urlsToTry = [
      '/api/appointments/api/appointments/',
      '/api/appointments/api/appointments',
      '/api/appointments/appointments/',
      '/api/appointments/api/'
    ];
    
    console.log('🎯 URLs que vamos a probar para crear cita:', urlsToTry);
    
    let lastError = null;
    
    for (const url of urlsToTry) {
      try {
        console.log(`🚀 Probando URL para crear cita: ${url}`);
        console.log('📦 Datos a enviar:', JSON.stringify(appointmentData, null, 2));
        
        const response = await apiClient.post(url, appointmentData);
        console.log(`✅ Cita creada exitosamente con URL: ${url}`, response.data);
        return response.data;
      } catch (error) {
        lastError = error;
        console.log(`❌ Falló URL: ${url} - Status: ${error.response?.status}`);
        console.log('Error detallado:', error.response?.data || error.message);
        
        if (error.response?.status !== 404) {
          // Si no es 404, entonces hay otro problema (500, 403, etc.)
          throw error;
        }
        // Si es 404, continúa con la siguiente URL
      }
    }
    
    // Si llegamos aquí, ninguna URL funcionó
    throw lastError || new Error('No se pudo crear la cita. Verifica que el backend esté correctamente configurado.');
    
  } catch (error) {
    console.error('💥 Error al crear cita:', error.response?.data || error);
    throw error;
  }
};

/**
 * Actualiza una cita existente
 * @param {number} id - ID de la cita
 * @param {Object} appointmentData - Datos actualizados de la cita
 * @returns {Promise} Promise con la respuesta
 */
export const updateAppointment = async (id, appointmentData) => {
  try {
    console.log(`Actualizando cita ${id} con datos:`, appointmentData);
    
    // Asegurar el formato correcto de la fecha y hora
    if (appointmentData.appointment_date && typeof appointmentData.appointment_date === 'string') {
      // Si la fecha está en formato DD/MM/YYYY, convertir a YYYY-MM-DD
      if (appointmentData.appointment_date.includes('/')) {
        const parts = appointmentData.appointment_date.split('/');
        if (parts.length === 3) {
          appointmentData.appointment_date = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
    }
    
    const url = `${API_ROUTES.APPOINTMENTS}/${id}/`;
    const response = await apiClient.put(url, appointmentData);
    console.log(`Cita ${id} actualizada:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar la cita con ID ${id}:`, error.response || error);
    throw error;
  }
};

/**
 * Cancela una cita
 * @param {number} id - ID de la cita
 * @param {Object} cancelData - Datos para la cancelación (razón, etc.)
 * @returns {Promise} Promise con la respuesta
 */
export const cancelAppointment = async (id, cancelData = {}) => {
  try {
    console.log(`Cancelando cita con ID: ${id}`);
    const url = `/api/appointments/api/${id}/cancel/`;
    const response = await apiClient.post(url, cancelData);
    console.log(`Cita ${id} cancelada:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al cancelar la cita con ID ${id}:`, error.response || error);
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
    const url = `/api/appointments/api/${id}/complete/`;
    const response = await apiClient.post(url);
    console.log(`Cita ${id} completada:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al marcar como completada la cita con ID ${id}:`, error.response || error);
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
    const url = `/api/appointments/api/${id}/no-show/`;
    const response = await apiClient.post(url);
    console.log(`Cita ${id} marcada como "no se presentó":`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al marcar como "no se presentó" la cita con ID ${id}:`, error.response || error);
    throw error;
  }
}; 