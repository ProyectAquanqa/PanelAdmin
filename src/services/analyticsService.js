import adminApiClient from '../api/adminApiClient';

/**
 * Service for fetching analytics data through the Django Admin API
 */
class AnalyticsService {
  /**
   * Get analytics summary data
   * @returns {Promise} - Promise with the analytics summary data
   */
  async getAnalyticsSummary() {
    try {
      const response = await adminApiClient.get('/analytics/summary/');
      console.log('📊 Datos recibidos del backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      throw error;
    }
  }

  /**
   * Get appointment analytics data
   * @param {Object} params - Query parameters for filtering (e.g., period)
   * @returns {Promise} - Promise with the appointment analytics data
   */
  async getAppointmentAnalytics(params = {}) {
    try {
      const response = await adminApiClient.get('/analytics/appointments/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment analytics:', error);
      throw error;
    }
  }

  /**
   * Get revenue analytics data
   * @param {Object} params - Query parameters for filtering (e.g., period)
   * @returns {Promise} - Promise with the revenue analytics data
   */
  async getRevenueAnalytics(params = {}) {
    try {
      const response = await adminApiClient.get('/analytics/revenue/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  }

  /**
   * Get doctor performance analytics data
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} - Promise with the doctor performance data
   */
  async getDoctorPerformance(params = {}) {
    try {
      const response = await adminApiClient.get('/analytics/doctors/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor performance analytics:', error);
      throw error;
    }
  }

  /**
   * Get patient demographics data
   * @returns {Promise} - Promise with the patient demographics data
   */
  async getPatientDemographics() {
    try {
      const response = await adminApiClient.get('/analytics/patients/demographics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching patient demographics:', error);
      throw error;
    }
  }

  /**
   * Get specialty demand data
   * @returns {Promise} - Promise with the specialty demand data
   */
  async getSpecialtyDemand() {
    try {
      const response = await adminApiClient.get('/analytics/specialties/demand/');
      return response.data;
    } catch (error) {
      console.error('Error fetching specialty demand:', error);
      throw error;
    }
  }
}

export default new AnalyticsService(); 