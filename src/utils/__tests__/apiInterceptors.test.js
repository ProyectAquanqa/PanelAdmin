/**
 * Tests para interceptores de API
 * Verifica el funcionamiento de transformación de errores, reintentos y manejo de tokens
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { 
  createApiClient, 
  apiClient, 
  setupInterceptors, 
  withRetry, 
  createRetryableRequest 
} from '../apiInterceptors.js';

// Mock de axios
vi.mock('axios');

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock de window.location
const locationMock = {
  href: '',
};
global.window = { location: locationMock };

describe('apiInterceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    locationMock.href = '';
    
    // Mock de axios.create
    const mockAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn(),
          clear: vi.fn(),
          handlers: []
        },
        response: {
          use: vi.fn(),
          clear: vi.fn(),
          handlers: []
        }
      },
      defaults: {},
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    
    axios.create.mockReturnValue(mockAxiosInstance);
    axios.post.mockResolvedValue({ data: { access: 'new-token' } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createApiClient', () => {
    it('should create axios instance with correct base configuration', () => {
      const client = createApiClient();
      
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: expect.stringContaining('api'),
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    });

    it('should setup request and response interceptors', () => {
      const client = createApiClient();
      
      expect(client.interceptors.request.use).toHaveBeenCalled();
      expect(client.interceptors.response.use).toHaveBeenCalled();
    });

    it('should accept custom configuration', () => {
      const customConfig = {
        timeout: 5000,
        headers: {
          'Custom-Header': 'value'
        }
      };
      
      createApiClient(customConfig);
      
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining(customConfig)
      );
    });
  });

  describe('Request Interceptor', () => {
    it('should add authorization header when token exists', () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      
      const client = createApiClient();
      const requestInterceptor = client.interceptors.request.use.mock.calls[0][0];
      
      const config = { headers: {} };
      const result = requestInterceptor(config);
      
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should not add authorization header when token does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const client = createApiClient();
      const requestInterceptor = client.interceptors.request.use.mock.calls[0][0];
      
      const config = { headers: {} };
      const result = requestInterceptor(config);
      
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should initialize retry metadata', () => {
      const client = createApiClient();
      const requestInterceptor = client.interceptors.request.use.mock.calls[0][0];
      
      const config = { headers: {} };
      const result = requestInterceptor(config);
      
      expect(result.metadata).toEqual({ retryCount: 0 });
    });
  });

  describe('Response Interceptor - 401 Handling', () => {
    it('should attempt token refresh on 401 error', async () => {
      localStorageMock.getItem.mockReturnValue('refresh-token');
      
      const client = createApiClient();
      const responseInterceptor = client.interceptors.response.use.mock.calls[0][1];
      
      const error = {
        response: { status: 401 },
        config: { headers: {}, metadata: { retryCount: 0 } }
      };
      
      // Mock successful refresh
      axios.post.mockResolvedValue({ data: { access: 'new-access-token' } });
      
      // Mock retry request
      client.mockResolvedValue({ data: 'success' });
      
      await responseInterceptor(error);
      
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/web/auth/refresh/'),
        { refresh: 'refresh-token' },
        expect.any(Object)
      );
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'new-access-token');
    });

    it('should redirect to login when refresh fails', async () => {
      localStorageMock.getItem.mockReturnValue('refresh-token');
      
      const client = createApiClient();
      const responseInterceptor = client.interceptors.response.use.mock.calls[0][1];
      
      const error = {
        response: { status: 401 },
        config: { headers: {}, metadata: { retryCount: 0 } }
      };
      
      // Mock failed refresh
      axios.post.mockRejectedValue(new Error('Refresh failed'));
      
      try {
        await responseInterceptor(error);
      } catch (e) {
        // Expected to throw
      }
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(locationMock.href).toBe('/login');
    });

    it('should not retry 401 if already retried', async () => {
      const client = createApiClient();
      const responseInterceptor = client.interceptors.response.use.mock.calls[0][1];
      
      const error = {
        response: { status: 401 },
        config: { headers: {}, metadata: { retryCount: 0 }, _retry: true }
      };
      
      try {
        await responseInterceptor(error);
      } catch (e) {
        expect(e.isTransformed).toBe(true);
        expect(e.type).toBe('auth');
      }
      
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  describe('Response Interceptor - Retry Logic', () => {
    it('should retry recoverable errors', async () => {
      const client = createApiClient();
      const responseInterceptor = client.interceptors.response.use.mock.calls[0][1];
      
      const error = {
        response: { status: 500 },
        config: { 
          method: 'GET',
          headers: {}, 
          metadata: { retryCount: 0 } 
        }
      };
      
      // Mock setTimeout
      vi.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());
      
      // Mock retry request
      client.mockResolvedValue({ data: 'success' });
      
      const result = await responseInterceptor(error);
      
      expect(error.config.metadata.retryCount).toBe(1);
      expect(result.data).toBe('success');
      
      vi.restoreAllMocks();
    });

    it('should not retry after max attempts', async () => {
      const client = createApiClient();
      const responseInterceptor = client.interceptors.response.use.mock.calls[0][1];
      
      const error = {
        response: { status: 500 },
        config: { 
          method: 'GET',
          headers: {}, 
          metadata: { retryCount: 3 } // Already at max
        }
      };
      
      try {
        await responseInterceptor(error);
      } catch (e) {
        expect(e.isTransformed).toBe(true);
        expect(e.type).toBe('api');
      }
      
      expect(client).not.toHaveBeenCalled();
    });

    it('should not retry non-idempotent methods by default', async () => {
      const client = createApiClient();
      const responseInterceptor = client.interceptors.response.use.mock.calls[0][1];
      
      const error = {
        response: { status: 500 },
        config: { 
          method: 'POST',
          headers: {}, 
          metadata: { retryCount: 0 } 
        }
      };
      
      try {
        await responseInterceptor(error);
      } catch (e) {
        expect(e.isTransformed).toBe(true);
      }
      
      expect(client).not.toHaveBeenCalled();
    });

    it('should retry POST when explicitly allowed', async () => {
      const client = createApiClient();
      const responseInterceptor = client.interceptors.response.use.mock.calls[0][1];
      
      const error = {
        response: { status: 500 },
        config: { 
          method: 'POST',
          retryOnPost: true,
          headers: {}, 
          metadata: { retryCount: 0 } 
        }
      };
      
      // Mock setTimeout
      vi.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());
      
      // Mock retry request
      client.mockResolvedValue({ data: 'success' });
      
      const result = await responseInterceptor(error);
      
      expect(result.data).toBe('success');
      
      vi.restoreAllMocks();
    });
  });

  describe('Error Transformation', () => {
    it('should transform errors to user-friendly format', async () => {
      const client = createApiClient();
      const responseInterceptor = client.interceptors.response.use.mock.calls[0][1];
      
      const error = {
        response: { status: 404 },
        config: { 
          method: 'GET',
          headers: {}, 
          metadata: { retryCount: 3 } // Max retries reached
        }
      };
      
      try {
        await responseInterceptor(error);
      } catch (transformedError) {
        expect(transformedError.isTransformed).toBe(true);
        expect(transformedError.type).toBe('api');
        expect(transformedError.message).toBeTruthy();
        expect(transformedError.originalError).toBe(error);
        expect(transformedError.timestamp).toBeInstanceOf(Date);
      }
    });
  });

  describe('withRetry utility', () => {
    it('should retry failed requests', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      
      // Mock setTimeout
      vi.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());
      
      const result = await withRetry(mockFn);
      
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(result).toBe('success');
      
      vi.restoreAllMocks();
    });

    it('should respect custom retry configuration', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Always fails'));
      
      const customConfig = {
        maxRetries: 1,
        retryCondition: () => true,
        retryDelay: () => 0
      };
      
      try {
        await withRetry(mockFn, customConfig);
      } catch (error) {
        expect(mockFn).toHaveBeenCalledTimes(2); // 1 initial + 1 retry
      }
    });
  });

  describe('createRetryableRequest', () => {
    it('should create request with retry logic', async () => {
      const axiosConfig = { url: '/test', method: 'GET' };
      const retryConfig = { maxRetries: 2 };
      
      // Mock apiClient to fail once then succeed
      apiClient.mockRejectedValueOnce(new Error('Network error'))
               .mockResolvedValue({ data: 'success' });
      
      // Mock setTimeout
      vi.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());
      
      const result = await createRetryableRequest(axiosConfig, retryConfig);
      
      expect(result.data).toBe('success');
      expect(apiClient).toHaveBeenCalledTimes(2);
      
      vi.restoreAllMocks();
    });
  });

  describe('setupInterceptors', () => {
    it('should clear existing interceptors and setup new ones', () => {
      const mockInstance = {
        interceptors: {
          request: {
            clear: vi.fn(),
            use: vi.fn(),
            handlers: []
          },
          response: {
            clear: vi.fn(),
            use: vi.fn(),
            handlers: []
          }
        }
      };
      
      setupInterceptors(mockInstance);
      
      expect(mockInstance.interceptors.request.clear).toHaveBeenCalled();
      expect(mockInstance.interceptors.response.clear).toHaveBeenCalled();
    });
  });
});