import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getDoctorsBySpecialty } from '../../services/appointment';

/**
 * Hook para manejar los doctores en el formulario de citas
 * @param {number|string} specialtyId - ID de la especialidad seleccionada
 * @returns {Object} Estado y funciones relacionadas con los doctores
 */
export const useAppointmentDoctors = (specialtyId) => {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Función para obtener doctores por especialidad
  const fetchDoctorsBySpecialty = async () => {
    if (!specialtyId) {
      setDoctors([]);
      return;
    }
    
    setLoadingDoctors(true);
    try {
      console.log(`🔍 Obteniendo doctores para especialidad ${specialtyId}...`);
      
      const doctorsList = await getDoctorsBySpecialty(specialtyId);
      
      const formattedDoctors = doctorsList.map(doctor => ({
        id: doctor.id,
        name: doctor.full_name || 
              (doctor.first_name && doctor.last_name ? `${doctor.first_name} ${doctor.last_name}` : null) ||
              doctor.name || 
              `Doctor #${doctor.id}`
      }));
      
      setDoctors(formattedDoctors);
      return formattedDoctors;
    } catch (error) {
      console.error('❌ Error al obtener doctores:', error);
      toast.error('Error al cargar los doctores disponibles');
      setDoctors([]);
      return [];
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Efecto para cargar doctores cuando cambia la especialidad
  useEffect(() => {
    fetchDoctorsBySpecialty();
  }, [specialtyId]);

  return {
    doctors,
    loadingDoctors,
    fetchDoctorsBySpecialty
  };
}; 