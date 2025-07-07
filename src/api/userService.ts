import apiClient from './apiClient';
import { User, PaginatedResponse } from '../types/api';

/**
 * User service for handling user-related API calls
 */
class UserService {
    /**
     * Get all users (paginated)
     */
    async getUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
        return apiClient.get<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`);
    }

    /**
     * Get a user by ID
     */
    async getUserById(userId: string): Promise<User> {
        return apiClient.get<User>(`/users/${userId}`);
    }

    /**
     * Update a user's profile
     */
    async updateUser(userId: string, userData: Partial<User>): Promise<User> {
        return apiClient.put<User>(`/users/${userId}`, userData);
    }

    /**
     * Get user's rides
     */
    async getUserRides(userId: string): Promise<any[]> {
        return apiClient.get<any[]>(`/users/${userId}/rides`);
    }

    /**
     * Get user's coupons
     */
    async getUserCoupons(userId: string): Promise<any[]> {
        return apiClient.get<any[]>(`/users/${userId}/coupons`);
    }

    /**
     * Get user's rewards
     */
    async getUserRewards(userId: string): Promise<any[]> {
        return apiClient.get<any[]>(`/users/${userId}/rewards`);
    }

    /**
     * Update user profile picture
     */
    async updateProfilePicture(userId: string, file: File): Promise<User> {
        const formData = new FormData();
        formData.append('profilePicture', file);

        return apiClient.post<User>(`/users/${userId}/profile-picture`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    /**
     * Get user's sustain points history
     */
    async getSustainPointsHistory(userId: string): Promise<any[]> {
        return apiClient.get<any[]>(`/users/${userId}/sustain-points-history`);
    }
}

const userService = new UserService();
export default userService;