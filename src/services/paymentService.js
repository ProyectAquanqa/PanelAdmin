import { adminApiClient } from '../api';
import { API_ROUTES } from '../config/api';

/**
 * Service for managing payments through the Django Admin API
 */
class PaymentService {
  /**
   * Get all payments with optional filtering
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} - Promise with the payments data
   */
  async getPayments(params = {}) {
    try {
      const response = await adminApiClient.get(API_ROUTES.PAYMENTS.LIST, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  /**
   * Get a specific payment by ID
   * @param {string|number} id - Payment ID
   * @returns {Promise} - Promise with the payment data
   */
  async getPaymentById(id) {
    try {
      const response = await adminApiClient.get(API_ROUTES.PAYMENTS.BY_ID(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new payment
   * @param {Object} paymentData - Payment data
   * @returns {Promise} - Promise with the created payment
   */
  async createPayment(paymentData) {
    try {
      const response = await adminApiClient.post(API_ROUTES.PAYMENTS.CREATE, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Update an existing payment
   * @param {string|number} id - Payment ID
   * @param {Object} paymentData - Updated payment data
   * @returns {Promise} - Promise with the updated payment
   */
  async updatePayment(id, paymentData) {
    try {
      const response = await adminApiClient.put(API_ROUTES.PAYMENTS.BY_ID(id), paymentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating payment with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a payment
   * @param {string|number} id - Payment ID
   * @returns {Promise} - Promise with the deletion result
   */
  async deletePayment(id) {
    try {
      const response = await adminApiClient.delete(API_ROUTES.PAYMENTS.BY_ID(id));
      return response.data;
    } catch (error) {
      console.error(`Error deleting payment with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all completed payments
   * @returns {Promise} - Promise with the completed payments data
   */
  async getCompletedPayments() {
    try {
      const response = await adminApiClient.get(API_ROUTES.PAYMENTS.COMPLETED);
      return response.data;
    } catch (error) {
      console.error('Error fetching completed payments:', error);
      throw error;
    }
  }

  /**
   * Get all payments in processing state
   * @returns {Promise} - Promise with the processing payments data
   */
  async getProcessingPayments() {
    try {
      const response = await adminApiClient.get(API_ROUTES.PAYMENTS.PROCESSING);
      return response.data;
    } catch (error) {
      console.error('Error fetching processing payments:', error);
      throw error;
    }
  }

  /**
   * Refund a payment
   * @param {string|number} id - Payment ID
   * @returns {Promise} - Promise with the refunded payment data
   */
  async refundPayment(id) {
    try {
      const response = await adminApiClient.post(API_ROUTES.PAYMENTS.REFUND(id));
      return response.data;
    } catch (error) {
      console.error(`Error refunding payment with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new PaymentService(); 