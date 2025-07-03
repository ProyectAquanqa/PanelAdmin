import adminApiClient from '../api/adminApiClient';

/**
 * Service for triggering test audit log events
 */
class AuditTestService {
  /**
   * Triggers a test event by creating a simple entity.
   * @param {string} module - The module to test (e.g., 'appointments', 'payments').
   * @returns {Promise}
   */
  async triggerTestEvent(module) {
    const payload = {
      description: `Test event for ${module} at ${new Date().toISOString()}`
    };
    // This endpoint should exist in the backend and be configured to
    // perform an action that is audited.
    try {
      const response = await adminApiClient.post(`/api/audit/trigger-test/${module}/`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error triggering test event for module ${module}:`, error);
      throw error;
    }
  }
}

export default new AuditTestService(); 