import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// API base URL - automatically detects environment
const getApiUrl = () => {
  // In production (Vercel), use the same domain
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  // In development, use localhost backend
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const API_URL = getApiUrl();

/**
 * Base API client for making HTTP requests to the backend
 */
class ApiClient {
    private client: AxiosInstance;
    private healthCheckInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000, // Increased timeout for serverless cold starts
            withCredentials: true,
        });

        // Add request interceptor to include auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor to handle common errors
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                // Log detailed error information for debugging
                console.error('API Request failed:', {
                    url: error.config?.url,
                    method: error.config?.method,
                    status: error.response?.status,
                    data: error.response?.data,
                    errorMessage: error.message
                });

                // Handle unauthorized error (401)
                if (error.response && error.response.status === 401) {
                    // Clear local storage
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');

                    // Redirect to login page if not already there
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
                }

                // Handle rate limiting (429)
                if (error.response && error.response.status === 429) {
                    error.message = 'Too many requests. Please try again later.';
                }

                // Handle server connection errors (no response from server)
                if (!error.response) {
                    error.message = 'Cannot connect to server. Please check your internet connection.';
                }
                // Enhance error object with more detailed message from the response if available
                else if (error.response && error.response.data) {
                    if (typeof error.response.data === 'string') {
                        error.message = error.response.data;
                    } else if (error.response.data.message) {
                        error.message = error.response.data.message;
                    } else if (error.response.data.error) {
                        error.message = error.response.data.error;
                    }
                }

                return Promise.reject(error);
            }
        );

        // Start health check monitoring
        this.startHealthCheck();
    }

    /**
     * Start periodic health checks to ensure backend is awake (prevents cold starts)
     */
    private startHealthCheck() {
        // Only in production to keep serverless functions warm
        if (import.meta.env.PROD) {
            this.healthCheckInterval = setInterval(async () => {
                try {
                    await this.get('/api/health');
                } catch (error) {
                    console.warn('Health check failed:', error);
                }
            }, 5 * 60 * 1000); // Every 5 minutes
        }
    }

    /**
     * Stop health check monitoring
     */
    public stopHealthCheck() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }

    /**
     * Check if backend is connected
     */
    async checkConnection(): Promise<boolean> {
        try {
            await this.get('/api/health');
            return true;
        } catch (error) {
            console.error('Backend connection check failed:', error);
            return false;
        }
    }

    /**
     * Make a GET request
     */
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.client.get<T>(url, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Make a POST request
     */
    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.client.post<T>(url, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Make a PUT request
     */
    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.client.put<T>(url, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Make a DELETE request
     */
    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.client.delete<T>(url, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get current API URL
     */
    public getBaseUrl(): string {
        return API_URL;
    }
}

// Create a singleton instance
const apiClient = new ApiClient();

// Log API URL on initialization
console.log('API Client initialized with base URL:', apiClient.getBaseUrl());

export default apiClient;