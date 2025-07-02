/**
 * Utilidad para inicializar la relación entre doctores y especialidades
 * 
 * Este script se puede ejecutar desde la consola del navegador para asignar
 * especialidades a doctores que no las tienen.
 */

import apiClient from '../api/apiClient';

/**
 * Obtiene todos los doctores
 * @returns {Promise<Array>} Lista de doctores
 */
const getAllDoctors = async () => {
  try {
    const response = await apiClient.get('/api/doctors/doctors/');
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.results) {
      return response.data.results;
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener doctores:', error);
    return [];
  }
};

/**
 * Obtiene todas las especialidades
 * @returns {Promise<Array>} Lista de especialidades
 */
const getAllSpecialties = async () => {
  try {
    const response = await apiClient.get('/api/catalogs/specialties/');
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.results) {
      return response.data.results;
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    return [];
  }
};

/**
 * Asigna una especialidad a un doctor
 * @param {number} doctorId - ID del doctor
 * @param {number} specialtyId - ID de la especialidad
 * @returns {Promise<boolean>} Éxito de la operación
 */
const assignSpecialtyToDoctor = async (doctorId, specialtyId) => {
  try {
    // Intentar diferentes formatos para la asignación
    try {
      await apiClient.post(`/api/doctors/doctors/${doctorId}/specialties/`, {
        specialty_id: specialtyId
      });
      return true;
    } catch (error1) {
      if (error1.response?.status === 404 || error1.response?.status === 400) {
        try {
          await apiClient.post(`/api/doctors/doctors/${doctorId}/specialties/${specialtyId}/`);
          return true;
        } catch (error2) {
          if (error2.response?.status === 404 || error2.response?.status === 400) {
            try {
              // Obtener doctor actual
              const doctorResponse = await apiClient.get(`/api/doctors/doctors/${doctorId}/`);
              const doctor = doctorResponse.data;
              
              // Agregar especialidad
              const specialties = doctor.specialties || [];
              specialties.push(specialtyId);
              
              // Actualizar doctor
              await apiClient.patch(`/api/doctors/doctors/${doctorId}/`, {
                specialties: specialties
              });
              
              return true;
            } catch (error3) {
              console.error(`Error al asignar especialidad ${specialtyId} al doctor ${doctorId} (formato 3):`, error3);
              return false;
            }
          }
          console.error(`Error al asignar especialidad ${specialtyId} al doctor ${doctorId} (formato 2):`, error2);
          return false;
        }
      }
      console.error(`Error al asignar especialidad ${specialtyId} al doctor ${doctorId} (formato 1):`, error1);
      return false;
    }
  } catch (error) {
    console.error(`Error al asignar especialidad ${specialtyId} al doctor ${doctorId}:`, error);
    return false;
  }
};

/**
 * Inicializa las especialidades para todos los doctores
 * @returns {Promise<void>}
 */
export const initializeDoctorSpecialties = async () => {
  console.log('🚀 Inicializando especialidades para doctores...');
  
  // Obtener doctores y especialidades
  const [doctors, specialties] = await Promise.all([
    getAllDoctors(),
    getAllSpecialties()
  ]);
  
  console.log(`📋 Obtenidos ${doctors.length} doctores y ${specialties.length} especialidades`);
  
  if (doctors.length === 0 || specialties.length === 0) {
    console.error('❌ No se pudieron obtener doctores o especialidades');
    return;
  }
  
  // Filtrar doctores sin especialidades
  const doctorsWithoutSpecialties = doctors.filter(doctor => 
    !doctor.specialties || 
    !Array.isArray(doctor.specialties) || 
    doctor.specialties.length === 0
  );
  
  console.log(`🔍 Encontrados ${doctorsWithoutSpecialties.length} doctores sin especialidades`);
  
  // Asignar especialidades a doctores
  let successCount = 0;
  
  for (const doctor of doctorsWithoutSpecialties) {
    // Seleccionar una especialidad aleatoria para cada doctor
    const randomSpecialty = specialties[Math.floor(Math.random() * specialties.length)];
    
    console.log(`🔄 Asignando especialidad ${randomSpecialty.name} (${randomSpecialty.id}) al doctor ${doctor.first_name} ${doctor.last_name} (${doctor.id})`);
    
    const success = await assignSpecialtyToDoctor(doctor.id, randomSpecialty.id);
    
    if (success) {
      successCount++;
      console.log(`✅ Especialidad asignada correctamente`);
    } else {
      console.error(`❌ Error al asignar especialidad`);
    }
  }
  
  console.log(`✅ Proceso completado. Se asignaron especialidades a ${successCount} de ${doctorsWithoutSpecialties.length} doctores`);
};

// Exportar función para poder usarla desde la consola
window.initializeDoctorSpecialties = initializeDoctorSpecialties;

export default {
  initializeDoctorSpecialties
}; 