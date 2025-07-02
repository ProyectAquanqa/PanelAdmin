import { useState, useEffect } from 'react';
import { useGetUsers } from '../useUsers';

/**
 * Hook para gestionar la lista de pacientes para el formulario de citas.
 * @returns {{patients: Array, loadingPatients: boolean}}
 */
export const useAppointmentPatients = () => {
  const { data: usersData, isLoading: loadingUsers, error } = useGetUsers();
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    if (usersData?.results) {
      const patientList = usersData.results
        .filter(user => user.role === 'PATIENT')
        .map(user => ({
          id: user.id,
          name: user.full_name || `${user.first_name} ${user.last_name}`,
        }));
      setPatients(patientList);
    }
  }, [usersData]);

  if (error) {
    console.error("Error fetching patients for appointment form:", error);
  }

  return {
    patients,
    loadingPatients: loadingUsers,
  };
}; 