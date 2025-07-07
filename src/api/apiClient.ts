import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// API base URL - correct base URL without /api suffix since routes already include it
const API_URL = 'http://localhost:5000';

/**
 * Base API client for making HTTP requests to the backend
 */
class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            // Add timeout to prevent hanging requests
            timeout: 10000,
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

                // Handle server connection errors (no response from server)
                if (!error.response) {
                    error.message = 'Cannot connect to server. Please check if the server is running.';
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
}

// Create a singleton instance
const apiClient = new ApiClient();
export default apiClient;