import adminApiClient from '../api/adminApiClient';

/**
 * Service for managing audit logs through the Django Admin API
 */
class AuditService {
  /**
   * Get all audit logs with optional filtering
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} - Promise with the audit logs data
   */
  async getAuditLogs(params = {}) {
    try {
      const response = await adminApiClient.get('/audit/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * Get a specific audit log by ID
   * @param {string|number} id - Audit log ID
   * @returns {Promise} - Promise with the audit log data
   */
  async getAuditLogById(id) {
    try {
      const response = await adminApiClient.get(`/audit/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching audit log with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an audit log
   * @param {string|number} id - Audit log ID
   * @returns {Promise} - Promise with the deletion result
   */
  async deleteAuditLog(id) {
    try {
      const response = await adminApiClient.delete(`/audit/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting audit log with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get recent audit logs
   * @returns {Promise} - Promise with the recent audit logs data
   */
  async getRecentAuditLogs() {
    try {
      const response = await adminApiClient.get('/audit/recent/');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit logs statistics
   * @returns {Promise} - Promise with the audit logs statistics
   */
  async getAuditStats() {
    try {
      const response = await adminApiClient.get('/audit/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      throw error;
    }
  }
}

export default new AuditService(); 