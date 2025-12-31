import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../api/authService';
import { User } from '../types/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
    logout: () => void;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Load user data from localStorage if available
        const checkAuthentication = async () => {
            setLoading(true);
            try {
                const currentUser = authService.getCurrentUser();
                if (currentUser && authService.getToken()) {
                    // Verify token is still valid
                    const isValid = await authService.verifyToken();
                    if (isValid) {
                        setUser(currentUser);
                    } else {
                        // Token invalid or expired, perform logout
                        authService.logout();
                    }
                }
            } catch (err) {
                console.error('Authentication check failed:', err);
                // Clear any invalid data
                authService.logout();
            } finally {
                setLoading(false);
            }
        };

        checkAuthentication();

        // Listen for auth events
        const handleLogout = () => {
            setUser(null);
            navigate('/');
        };

        const handleUnauthorized = () => {
            setUser(null);
            navigate('/login');
        };

        window.addEventListener('auth:logout', handleLogout);
        window.addEventListener('auth:unauthorized', handleUnauthorized);

        return () => {
            window.removeEventListener('auth:logout', handleLogout);
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, [navigate]);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.login({ email, password });
            setUser(response.user);
        } catch (err: any) {
            console.error('Login error details:', err);
            setError(err.message || 'Login failed. Please check your credentials and try again.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string, phone?: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.register({ name, email, password, phone });
            setUser(response.user);
        } catch (err: any) {
            console.error('Registration error details:', err);
            setError(err.message || 'Registration failed. Please check your information and try again.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const clearError = () => {
        setError(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                error,
                clearError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};