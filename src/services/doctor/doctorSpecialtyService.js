import adminApiClient from '../../api/adminApiClient';
import { normalizeDoctorData } from './doctorTransformService';

/**
 * Normaliza los datos de una especialidad
 * @param {Object|number} specialty - Datos de la especialidad
 * @returns {Object} Especialidad normalizada
 */
const normalizeSpecialty = (specialty) => {
  if (!specialty) return null;
  
  // Si es un número o string, crear un objeto básico
  if (typeof specialty === 'number' || typeof specialty === 'string') {
    const id = typeof specialty === 'string' ? parseInt(specialty, 10) : specialty;
    return {
      id,
      name: `Especialidad ${id}`,
      is_active: true
    };
  }
  
  // Si es un objeto, normalizar sus propiedades
  return {
    id: specialty.id || specialty.specialty_id || 
        (specialty.specialty && typeof specialty.specialty === 'object' ? specialty.specialty.id : specialty.specialty),
    name: specialty.name || specialty.specialty_name || 
          (specialty.specialty && typeof specialty.specialty === 'object' ? specialty.specialty.name : null) || 
          `Especialidad ${specialty.id || specialty.specialty_id || '?'}`,
    description: specialty.description || specialty.specialty_description || '',
    is_active: specialty.is_active !== undefined ? specialty.is_active : true
  };
};

/**
 * Obtiene doctores filtrados por tipo (PRIMARY, SPECIALIST)
 * @param {string} doctorType - Tipo de doctor (PRIMARY, SPECIALIST)
 * @returns {Promise} Promise con la respuesta normalizada
 */
const getDoctorsByType = async (doctorType) => {
  try {
    console.log(`🔍 Obteniendo doctores de tipo ${doctorType}`);
    const url = `/api/doctors/doctors/by_type/?doctor_type=${doctorType}`;
    const response = await adminApiClient.get(url);
    console.log(`✅ Doctores de tipo ${doctorType}:`, response.data);
    
    let doctorsData = [];
    if (Array.isArray(response.data)) {
      doctorsData = response.data.map(normalizeDoctorData);
    } else if (response.data && response.data.results) {
      doctorsData = response.data.results.map(normalizeDoctorData);
    }
    
    return {
      results: doctorsData,
      count: doctorsData.length
    };
  } catch (error) {
    console.error(`❌ Error al obtener doctores de tipo ${doctorType}:`, error);
    throw error;
  }
};

/**
 * Obtiene doctores que pueden derivar pacientes
 * @returns {Promise} Promise con la respuesta normalizada
 */
const getDoctorsThatCanRefer = async () => {
  try {
    console.log('🔍 Obteniendo doctores que pueden derivar');
    const response = await adminApiClient.get('/api/doctors/doctors/can_refer_doctors/');
    console.log('✅ Doctores que pueden derivar:', response.data);
    
    let doctorsData = [];
    if (Array.isArray(response.data)) {
      doctorsData = response.data.map(normalizeDoctorData);
    } else if (response.data && response.data.results) {
      doctorsData = response.data.results.map(normalizeDoctorData);
    }
    
    return {
      results: doctorsData,
      count: doctorsData.length
    };
  } catch (error) {
    console.error('❌ Error al obtener doctores que pueden derivar:', error);
    throw error;
  }
};

/**
 * Obtiene doctores por especialidad
 * @param {number} specialtyId - ID de la especialidad
 * @returns {Promise} Promise con la respuesta normalizada
 */
const getDoctorsBySpecialty = async (specialtyId) => {
  try {
    console.log(`🔍 Obteniendo doctores por especialidad ${specialtyId}`);
    const url = `/api/doctors/doctors/by_specialty/?specialty=${specialtyId}`;
    const response = await adminApiClient.get(url);
    console.log(`✅ Doctores por especialidad ${specialtyId}:`, response.data);
    
    let doctorsData = [];
    if (Array.isArray(response.data)) {
      doctorsData = response.data.map(normalizeDoctorData);
    } else if (response.data && response.data.results) {
      doctorsData = response.data.results.map(normalizeDoctorData);
    }
    
    return {
      results: doctorsData,
      count: doctorsData.length
    };
  } catch (error) {
    console.error(`❌ Error al obtener doctores por especialidad ${specialtyId}:`, error);
    throw error;
  }
};

/**
 * Obtiene las especialidades de un doctor específico
 * @param {number} doctorId - ID del doctor
 * @returns {Promise} Promise con la respuesta
 */
const getDoctorSpecialties = async (doctorId) => {
  if (!doctorId) {
    console.warn('⚠️ Se intentó obtener especialidades sin proporcionar ID de doctor');
    return { results: [], count: 0, ids: [] };
  }
  
  try {
    console.log(`🔍 Obteniendo especialidades del doctor ${doctorId}`);
    
    // Intentar con el primer endpoint (según endpints.md)
    const response = await adminApiClient.get(`/api/doctors/specialties/by_doctor/?doctor_id=${doctorId}`);
    console.log(`✅ Especialidades del doctor ${doctorId} (raw):`, response.data);
    
    // Normalizar respuesta
    let specialties = [];
    
    if (Array.isArray(response.data)) {
      specialties = response.data;
    } else if (response.data && response.data.results) {
      specialties = response.data.results;
    } else if (response.data && typeof response.data === 'object') {
      // Si es un objeto pero no tiene .results, intentar extraer valores
      specialties = Object.values(response.data);
    }
    
    // Normalizar cada especialidad
    const normalizedSpecialties = specialties.map(normalizeSpecialty).filter(Boolean);
    
    // Extraer IDs de especialidades
    const specialtyIds = normalizedSpecialties.map(spec => spec.id).filter(id => id !== undefined && id !== null);
    
    console.log(`✅ Especialidades normalizadas del doctor ${doctorId}:`, normalizedSpecialties);
    console.log(`✅ IDs de especialidades del doctor ${doctorId}:`, specialtyIds);
    
    // Verificar si se obtuvieron todas las especialidades
    try {
      // Intentar obtener todas las especialidades para verificar
      const allSpecialtiesResponse = await adminApiClient.get('/api/doctors/specialties/');
      let allSpecialties = [];
      
      if (Array.isArray(allSpecialtiesResponse.data)) {
        allSpecialties = allSpecialtiesResponse.data;
      } else if (allSpecialtiesResponse.data && allSpecialtiesResponse.data.results) {
        allSpecialties = allSpecialtiesResponse.data.results;
      }
      
      const allSpecialtyIds = allSpecialties.map(s => s.id).filter(Boolean);
      console.log(`ℹ️ Total de especialidades disponibles: ${allSpecialtyIds.length}`);
      console.log(`ℹ️ Especialidades del doctor: ${specialtyIds.length}`);
      
      // Verificar si hay especialidades que deberían estar pero no están
      if (allSpecialtyIds.length > 0 && specialtyIds.length === 0) {
        console.warn('⚠️ No se encontraron especialidades para el doctor, pero hay especialidades disponibles');
      }
    } catch (verifyError) {
      console.error('❌ Error al verificar especialidades disponibles:', verifyError);
    }
    
    return {
      results: normalizedSpecialties,
      ids: specialtyIds,
      count: normalizedSpecialties.length
    };
  } catch (error) {
    console.error(`❌ Error al obtener especialidades del doctor ${doctorId}:`, error);
    
    // Intentar con un endpoint alternativo
    try {
      console.log(`🔍 Intentando endpoint alternativo para especialidades del doctor ${doctorId}`);
      const alternativeResponse = await adminApiClient.get(`/api/doctors/doctor_specialties/?doctor_id=${doctorId}`);
      console.log(`✅ Especialidades del doctor ${doctorId} (alternativo):`, alternativeResponse.data);
      
      let specialties = [];
      if (Array.isArray(alternativeResponse.data)) {
        specialties = alternativeResponse.data;
      } else if (alternativeResponse.data && alternativeResponse.data.results) {
        specialties = alternativeResponse.data.results;
      }
      
      const normalizedSpecialties = specialties.map(normalizeSpecialty).filter(Boolean);
      const specialtyIds = normalizedSpecialties.map(spec => spec.id).filter(id => id !== undefined && id !== null);
      
      return {
        results: normalizedSpecialties,
        ids: specialtyIds,
        count: normalizedSpecialties.length,
        is_alternative: true
      };
    } catch (secondError) {
      console.error(`❌ Error en endpoint alternativo para especialidades del doctor ${doctorId}:`, secondError);
      
      // Intentar con otro endpoint alternativo
      try {
        console.log(`🔍 Intentando segundo endpoint alternativo para especialidades del doctor ${doctorId}`);
        const secondAlternativeResponse = await adminApiClient.get(`/api/catalogs/specialties/`);
        
        let allSpecialties = [];
        if (Array.isArray(secondAlternativeResponse.data)) {
          allSpecialties = secondAlternativeResponse.data;
        } else if (secondAlternativeResponse.data && secondAlternativeResponse.data.results) {
          allSpecialties = secondAlternativeResponse.data.results;
        }
        
        // Como fallback, devolver todas las especialidades disponibles
        // Esto no es ideal pero al menos mostrará opciones
        const normalizedSpecialties = allSpecialties.map(normalizeSpecialty).filter(Boolean);
        
        console.warn(`⚠️ No se pudieron obtener las especialidades específicas del doctor ${doctorId}. Mostrando todas las especialidades disponibles.`);
        
        return {
          results: normalizedSpecialties,
          ids: [], // No seleccionar ninguna por defecto
          count: normalizedSpecialties.length,
          is_fallback: true
        };
      } catch (thirdError) {
        console.error(`❌ Error en segundo endpoint alternativo:`, thirdError);
        return { results: [], ids: [], count: 0 };
      }
    }
  }
};

/**
 * Asigna una especialidad a un doctor
 * @param {number} doctorId - ID del doctor
 * @param {number} specialtyId - ID de la especialidad
 * @returns {Promise} Promise con la respuesta
 */
const assignSpecialtyToDoctor = async (doctorId, specialtyId) => {
  try {
    console.log(`🔍 Asignando especialidad ${specialtyId} al doctor ${doctorId}`);
    
    // Determinar el formato de especialidades a usar
    const format = localStorage.getItem('specialtiesFormat') || 'default';
    let payload = { doctor_id: doctorId };
    
    if (format === 'objects') {
      payload.specialty_id = specialtyId;
    } else if (format === 'specialty_objects') {
      payload.specialty = specialtyId;
    } else {
      // Formato por defecto
      payload.specialty_id = specialtyId;
    }
    
    // Intentar con el primer endpoint (según endpints.md)
    const response = await adminApiClient.post(`/api/doctors/specialties/`, payload);
    console.log(`✅ Especialidad ${specialtyId} asignada al doctor ${doctorId}:`, response.data);
    
    return response.data;
  } catch (error) {
    console.error(`❌ Error al asignar especialidad ${specialtyId} al doctor ${doctorId}:`, error);
    
    // Intentar con un endpoint alternativo
    try {
      console.log(`🔍 Intentando endpoint alternativo para asignar especialidad ${specialtyId} al doctor ${doctorId}`);
      
      const alternativePayload = {
        doctor: doctorId,
        specialty_id: specialtyId
      };
      
      const alternativeResponse = await adminApiClient.post(`/api/doctors/doctor_specialties/`, alternativePayload);
      console.log(`✅ Especialidad ${specialtyId} asignada al doctor ${doctorId} (alternativo):`, alternativeResponse.data);
      
      return alternativeResponse.data;
    } catch (secondError) {
      console.error(`❌ Error en endpoint alternativo para asignar especialidad:`, secondError);
      
      // Intentar con un tercer endpoint
      try {
        console.log(`🔍 Intentando segundo endpoint alternativo para asignar especialidad ${specialtyId} al doctor ${doctorId}`);
        
        const thirdPayload = {
          specialty_id: specialtyId
        };
        
        const thirdResponse = await adminApiClient.post(`/api/doctors/doctors/${doctorId}/specialties/`, thirdPayload);
        console.log(`✅ Especialidad ${specialtyId} asignada al doctor ${doctorId} (tercer intento):`, thirdResponse.data);
        
        return thirdResponse.data;
      } catch (thirdError) {
        console.error(`❌ Error en segundo endpoint alternativo:`, thirdError);
        throw error; // Lanzar el error original
      }
    }
  }
};

/**
 * Elimina una especialidad de un doctor
 * @param {number} doctorId - ID del doctor
 * @param {number} specialtyId - ID de la especialidad
 * @returns {Promise} Promise con la respuesta
 */
const removeSpecialtyFromDoctor = async (doctorId, specialtyId) => {
  try {
    console.log(`🔍 Eliminando especialidad ${specialtyId} del doctor ${doctorId}`);
    
    // Primero, intentar obtener el ID de la relación doctor-especialidad
    const specialtiesResponse = await adminApiClient.get(`/api/doctors/specialties/by_doctor/?doctor_id=${doctorId}`);
    
    let doctorSpecialties = [];
    if (Array.isArray(specialtiesResponse.data)) {
      doctorSpecialties = specialtiesResponse.data;
    } else if (specialtiesResponse.data && specialtiesResponse.data.results) {
      doctorSpecialties = specialtiesResponse.data.results;
    }
    
    console.log(`✅ Especialidades actuales del doctor ${doctorId}:`, doctorSpecialties);
    
    // Buscar la relación que corresponde a la especialidad a eliminar
    const relationToDelete = doctorSpecialties.find(spec => {
      if (!spec) return false;
      
      const specId = typeof spec === 'object' ? 
        spec.id || spec.specialty_id || 
        (spec.specialty && typeof spec.specialty === 'object' ? spec.specialty.id : spec.specialty) : 
        spec;
      
      return specId === specialtyId;
    });
    
    console.log('Relación a eliminar:', relationToDelete);
    
    if (!relationToDelete) {
      throw new Error(`No se encontró la relación entre doctor ${doctorId} y especialidad ${specialtyId}`);
    }
    
    const relationId = relationToDelete.id || specialtyId;
    
    // Intentar eliminar con el primer endpoint
    const response = await adminApiClient.delete(`/api/doctors/specialties/${relationId}/?doctor_id=${doctorId}`);
    console.log(`✅ Especialidad ${specialtyId} eliminada del doctor ${doctorId}`);
    
    return response.data;
  } catch (error) {
    console.error(`❌ Error al eliminar especialidad ${specialtyId} del doctor ${doctorId}:`, error);
    
    // Intentar con un endpoint alternativo
    try {
      console.log(`🔍 Intentando endpoint alternativo para eliminar especialidad ${specialtyId} del doctor ${doctorId}`);
      
      // Intentar eliminar directamente
      const alternativeResponse = await adminApiClient.delete(`/api/doctors/doctors/${doctorId}/specialties/${specialtyId}/`);
      console.log(`✅ Especialidad ${specialtyId} eliminada del doctor ${doctorId} (alternativo)`);
      
      return alternativeResponse.data;
    } catch (secondError) {
      console.error(`❌ Error en endpoint alternativo para eliminar especialidad:`, secondError);
      throw error; // Lanzar el error original
    }
  }
};

/**
 * Actualiza todas las especialidades de un doctor
 * @param {number} doctorId - ID del doctor
 * @param {Array} specialties - Array de IDs de especialidades
 * @returns {Promise} Promise con la respuesta
 */
const updateDoctorSpecialties = async (doctorId, specialties) => {
  try {
    console.log(`🔍 Actualizando especialidades del doctor ${doctorId}:`, specialties);
    
    // Obtener especialidades actuales
    const currentSpecialtiesResponse = await adminApiClient.get(`/api/doctors/specialties/by_doctor/?doctor_id=${doctorId}`);
    
    let currentSpecialties = [];
    if (Array.isArray(currentSpecialtiesResponse.data)) {
      currentSpecialties = currentSpecialtiesResponse.data;
    } else if (currentSpecialtiesResponse.data && currentSpecialtiesResponse.data.results) {
      currentSpecialties = currentSpecialtiesResponse.data.results;
    }
    
    // Extraer IDs actuales
    const currentIds = currentSpecialties.map(spec => {
      if (typeof spec === 'object') {
        return spec.id || spec.specialty_id || 
               (spec.specialty && typeof spec.specialty === 'object' ? spec.specialty.id : spec.specialty);
      }
      return spec;
    }).filter(id => id !== undefined && id !== null);
    
    console.log(`✅ IDs de especialidades actuales: ${currentIds.join(', ')}`);
    console.log(`✅ IDs de especialidades nuevas: ${specialties.join(', ')}`);
    
    // Determinar qué especialidades agregar y cuáles eliminar
    const toAdd = specialties.filter(id => !currentIds.includes(id));
    const toRemove = currentIds.filter(id => !specialties.includes(id));
    
    console.log(`➕ Especialidades a agregar: ${toAdd.join(', ')}`);
    console.log(`➖ Especialidades a eliminar: ${toRemove.join(', ')}`);
    
    // Realizar operaciones
    const results = { added: 0, removed: 0, errors: [] };
    
    // Agregar nuevas especialidades
    for (const specialtyId of toAdd) {
      try {
        await assignSpecialtyToDoctor(doctorId, specialtyId);
        results.added++;
      } catch (error) {
        console.error(`❌ Error al agregar especialidad ${specialtyId}:`, error);
        results.errors.push({ type: 'add', specialtyId, error: error.message });
      }
    }
    
    // Eliminar especialidades que ya no se necesitan
    for (const specialtyId of toRemove) {
      try {
        await removeSpecialtyFromDoctor(doctorId, specialtyId);
        results.removed++;
      } catch (error) {
        console.error(`❌ Error al eliminar especialidad ${specialtyId}:`, error);
        results.errors.push({ type: 'remove', specialtyId, error: error.message });
      }
    }
    
    // Verificar resultados
    console.log(`✅ Actualización completada: ${results.added} agregadas, ${results.removed} eliminadas, ${results.errors.length} errores`);
    
    return results;
  } catch (error) {
    console.error(`❌ Error al actualizar especialidades del doctor ${doctorId}:`, error);
    throw error;
  }
};

// Exportar todas las funciones
export {
  normalizeSpecialty,
  getDoctorsByType,
  getDoctorsThatCanRefer,
  getDoctorsBySpecialty,
  getDoctorSpecialties,
  assignSpecialtyToDoctor,
  removeSpecialtyFromDoctor,
  updateDoctorSpecialties
}; 