import adminApiClient from '../../api/adminApiClient';
import { format } from 'date-fns';

export const getDoctorAvailableDates = async (doctorId, startDate, endDate) => {
  if (!doctorId) {
    return { available_dates: [] };
  }
  
  try {
    const params = {};
    if (startDate) {
      params.start_date = format(startDate, 'yyyy-MM-dd');
    }
    if (endDate) {
      params.end_date = format(endDate, 'yyyy-MM-dd');
    }

    const response = await adminApiClient.get(`/api/doctors/doctors/${doctorId}/available-dates/`, { params });
    console.log("Fechas disponibles recibidas:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor's available dates:", error);
    throw error;
  }
}; 