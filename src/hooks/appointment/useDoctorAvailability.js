import { useState, useCallback } from 'react';
import { getDoctorAvailableDates } from '../../services/doctor/availabilityService';
import { parseISO } from 'date-fns';

export const useDoctorAvailability = () => {
  const [availableDates, setAvailableDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAvailableDates = useCallback(async (doctorId, startDate, endDate) => {
    if (!doctorId) {
      setAvailableDates([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getDoctorAvailableDates(doctorId, startDate, endDate);
      // Convertir las cadenas de fecha a objetos Date
      const dates = data.available_dates.map(dateStr => parseISO(dateStr));
      setAvailableDates(dates);
    } catch (err) {
      setError(err);
      console.error("Failed to fetch available dates:", err);
      setAvailableDates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    availableDates,
    isLoading,
    error,
    fetchAvailableDates,
  };
}; 