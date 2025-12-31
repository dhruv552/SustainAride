import apiClient from './apiClient';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/api';

/**
 * Authentication service for user login, registration, and session management
 */
class AuthService {
    /**
     * Check if the server is running and accessible
     */
    async checkServerStatus(): Promise<boolean> {
        try {
            // Use the root endpoint for server status check
            const response = await apiClient.get<{ message: string }>('/');
            console.log('Server is running:', response);
            return true;
        } catch (error) {
            console.error('Server status check failed:', error);
            return false;
        }
    }

    /**
     * Login a user with email and password
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        try {
            // Check if server is running first
            const isServerRunning = await this.checkServerStatus();
            if (!isServerRunning) {
                throw new Error('Server is not running. Please start the server and try again.');
            }

            const response = await apiClient.post<AuthResponse>('/api/auth/login', data);

            // Save auth token and user to local storage
            if (response.token) {
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            return response;
        } catch (error) {
            // Let the error propagate to be caught by the calling function
            throw error;
        }
    }

    /**
     * Register a new user
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        try {
            // Check if server is running first
            const isServerRunning = await this.checkServerStatus();
            if (!isServerRunning) {
                throw new Error('Server is not running. Please start the server and try again.');
            }

            const response = await apiClient.post<AuthResponse>('/api/auth/register', data);

            // Save auth token and user to local storage
            if (response.token) {
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            return response;
        } catch (error) {
            // Let the error propagate to be caught by the calling function
            throw error;
        }
    }

    /**
     * Logout the current user
     */
    logout(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');

        // Redirect to home page using event (will be handled by React Router)
        window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    /**
     * Check if the user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    }

    /**
     * Get the current authenticated user
     */
    getCurrentUser(): User | null {
        const userJson = localStorage.getItem('user');
        if (userJson) {
            try {
                return JSON.parse(userJson) as User;
            } catch (error) {
                console.error('Failed to parse user JSON', error);
                return null;
            }
        }
        return null;
    }

    /**
     * Get the authentication token
     */
    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    /**
     * Verify the current token is valid
     */
    async verifyToken(): Promise<boolean> {
        try {
            await apiClient.get<{ valid: boolean }>('/api/auth/verify');
            return true;
        } catch (error) {
            this.logout();
            return false;
        }
    }
}

const authService = new AuthService();
export default authService;