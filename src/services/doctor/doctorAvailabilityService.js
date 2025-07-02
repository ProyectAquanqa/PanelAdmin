import adminApiClient from '../../api/adminApiClient';
import { API_ROUTES } from '../../config/api';

/**
 * Obtiene la disponibilidad de un doctor, manejando paginación para obtener todos los resultados.
 * @param {number} doctorId - ID del doctor
 * @returns {Promise} Promise con la respuesta normalizada
 */
export const getDoctorAvailability = async (doctorId) => {
  try {
    console.log(`🔍 Solicitando disponibilidad completa del doctor ${doctorId}`);
    
    let allResults = [];
    let url = `${API_ROUTES.DOCTORS.AVAILABILITY_BY_DOCTOR}?doctor_id=${doctorId}&include_all=true`;

    while (url) {
      console.log(`   ... Obteniendo página: ${url}`);
      const response = await adminApiClient.get(url);
      const data = response.data;

      if (data && Array.isArray(data.results)) { // Maneja la respuesta paginada de DRF
        allResults = allResults.concat(data.results);
        // El apiClient está configurado con un baseURL, por lo que podemos usar la URL relativa de 'next'
        // Pero primero la limpiamos por si viene con el host completo.
        const nextUrl = data.next ? new URL(data.next).pathname + new URL(data.next).search : null;
        url = nextUrl;
      } else if (Array.isArray(data)) { // Maneja respuestas no paginadas que son un array simple
        allResults = data;
        url = null;
      } else { // Si el formato no es el esperado, detenemos el bucle
        console.warn('Formato de respuesta de disponibilidad no esperado:', data);
        if(data && Array.isArray(data.results)) {
            allResults = allResults.concat(data.results);
        }
        url = null;
      }
    }
    
    console.log(`✅ Disponibilidad total obtenida para doctor ${doctorId} (total: ${allResults.length})`);
    return normalizeAvailabilityResponse(allResults);

  } catch (error) {
    console.error(`💥 Error al obtener disponibilidad completa del doctor ${doctorId}:`, error.response || error);
    // Devolver array vacío en caso de error para no romper la UI
    return { results: [], count: 0 };
  }
};

/**
 * Crea una nueva disponibilidad para un doctor
 * @param {Object} availabilityData - Datos de la disponibilidad
 * @returns {Promise} Promise con la respuesta
 */
export const createDoctorAvailability = async (availabilityData) => {
  try {
    console.log('📤 Creando disponibilidad:', availabilityData);
    
    // Asegurarse de que los datos tienen el formato correcto
    const preparedData = prepareAvailabilityData(availabilityData);
    
    const response = await adminApiClient.post(API_ROUTES.DOCTORS.AVAILABILITY, preparedData);
    console.log('✅ Disponibilidad creada:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('💥 Error al crear disponibilidad:', error.response || error);
    throw error;
  }
};

/**
 * Actualiza una disponibilidad existente
 * @param {number} id - ID de la disponibilidad
 * @param {Object} availabilityData - Datos actualizados
 * @returns {Promise} Promise con la respuesta
 */
export const updateDoctorAvailability = async (id, availabilityData) => {
  try {
    console.log(`📤 Actualizando disponibilidad ${id}:`, availabilityData);
    
    // Asegurarse de que los datos tienen el formato correcto
    const preparedData = prepareAvailabilityData(availabilityData);
    
    // Intentar primero con PUT
    try {
      const response = await adminApiClient.put(API_ROUTES.DOCTORS.AVAILABILITY_BY_ID(id), preparedData);
      console.log('✅ Disponibilidad actualizada con PUT:', response.data);
      return response.data;
    } catch (putError) {
      // Si falla con 405 Method Not Allowed, intentar con PATCH
      if (putError.response?.status === 405) {
        console.log('⚠️ PUT no permitido, intentando con PATCH');
        const patchResponse = await adminApiClient.patch(API_ROUTES.DOCTORS.AVAILABILITY_BY_ID(id), preparedData);
        console.log('✅ Disponibilidad actualizada con PATCH:', patchResponse.data);
        return patchResponse.data;
      }
      throw putError;
    }
  } catch (error) {
    console.error(`💥 Error al actualizar disponibilidad ${id}:`, error.response || error);
    throw error;
  }
};

/**
 * Elimina una disponibilidad
 * @param {number} id - ID de la disponibilidad
 * @returns {Promise} Promise con la respuesta
 */
export const deleteDoctorAvailability = async (id) => {
  try {
    console.log(`🗑️ Eliminando disponibilidad ${id}`);
    
    const response = await adminApiClient.delete(API_ROUTES.DOCTORS.AVAILABILITY_BY_ID(id));
    console.log(`✅ Disponibilidad ${id} eliminada`);
    
    return response.data;
  } catch (error) {
    console.error(`💥 Error al eliminar disponibilidad ${id}:`, error.response || error);
    throw error;
  }
};

/**
 * Normaliza la respuesta de disponibilidad para manejar diferentes formatos
 * @param {Object|Array} data - Datos de disponibilidad a normalizar
 * @returns {Object} Datos normalizados con formato consistente
 */
const normalizeAvailabilityResponse = (data) => {
  if (!data) {
    return { results: [], count: 0 };
  }
  
  // Si es un array directo
  if (Array.isArray(data)) {
    return {
      results: data,
      count: data.length
    };
  }
  
  // Si tiene estructura de paginación de Django REST
  if (data.results && Array.isArray(data.results)) {
    return {
      results: data.results,
      count: data.count || data.results.length,
      next: data.next,
      previous: data.previous
    };
  }
  
  // Si es un objeto pero no tiene una estructura reconocida
  return {
    results: [data],
    count: 1
  };
};

/**
 * Prepara los datos de disponibilidad para enviar al servidor
 * @param {Object} data - Datos a preparar
 * @returns {Object} Datos preparados
 */
const prepareAvailabilityData = (data) => {
  // Crear una copia para no modificar el original
  const preparedData = { ...data };
  
  // Asegurarse de que doctor_id sea un número
  if (preparedData.doctor_id) {
    preparedData.doctor_id = Number(preparedData.doctor_id);
  } else if (preparedData.doctor) {
    preparedData.doctor_id = Number(preparedData.doctor);
    delete preparedData.doctor;
  }
  
  // Mapear time_block a time_block_id si es necesario
  // El backend espera un FK (ID) para el bloque de tiempo
  if (data.time_block && !data.time_block_id) {
    const timeBlockMapping = {
      'MORNING': 1,
      'AFTERNOON': 2,
    };
    preparedData.time_block_id = timeBlockMapping[data.time_block];
    // No eliminar time_block, puede que la API de actualización lo use
  }
  
  // Asegurarse de que day_of_week sea un número
  if (preparedData.day_of_week !== undefined) {
    preparedData.day_of_week = Number(preparedData.day_of_week);
  }
  
  // Asegurarse de que max_patients sea un número
  if (preparedData.max_patients !== undefined) {
    preparedData.max_patients = Number(preparedData.max_patients);
  }
  
  // Convertir is_available a booleano
  if (preparedData.is_available !== undefined) {
    preparedData.is_available = Boolean(preparedData.is_available);
  }
  
  return preparedData;
};

/**
 * Actualiza múltiples horarios de disponibilidad
 * @param {Array} availabilities - Lista de disponibilidades a actualizar
 * @returns {Promise} Promise con la respuesta
 */
export const updateMultipleAvailabilities = async (availabilities) => {
  try {
    console.log(`📤 Actualizando ${availabilities.length} disponibilidades`);
    
    const promises = availabilities.map(availability => {
      if (availability.id) {
        return updateDoctorAvailability(availability.id, availability);
      } else {
        return createDoctorAvailability(availability);
      }
    });
    
    const results = await Promise.all(promises);
    console.log('✅ Disponibilidades actualizadas:', results);
    
    return results;
  } catch (error) {
    console.error('❌ Error al actualizar disponibilidades:', error);
    throw error;
  }
};

/**
 * Obtiene los bloques de disponibilidad por día de la semana
 * @param {number} dayOfWeek - Día de la semana (1-7)
 * @returns {Promise} Promise con la respuesta
 */
export const getAvailabilityByDay = async (dayOfWeek) => {
  try {
    console.log(`🔍 Solicitando disponibilidad para el día ${dayOfWeek}`);
    
    const url = `${API_ROUTES.DOCTORS.AVAILABILITY}by_day/?day_of_week=${dayOfWeek}`;
    const response = await adminApiClient.get(url);
    
    // Normalizar respuesta
    let availabilityData = [];
    if (Array.isArray(response.data)) {
      availabilityData = response.data;
    } else if (response.data && response.data.results) {
      availabilityData = response.data.results;
    }
    
    console.log(`✅ Disponibilidad obtenida para el día ${dayOfWeek}:`, availabilityData);
    return availabilityData;
  } catch (error) {
    console.error(`❌ Error al obtener disponibilidad para el día ${dayOfWeek}:`, error);
    throw error;
  }
}; 