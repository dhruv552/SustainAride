import apiClient from './apiClient';
import { Ride, PaginatedResponse } from '../types/api';

/**
 * Ride service for handling ride-related API calls
 */
class RideService {
    /**
     * Get all rides (paginated)
     */
    async getRides(page = 1, limit = 10): Promise<PaginatedResponse<Ride>> {
        return apiClient.get<PaginatedResponse<Ride>>(`/rides?page=${page}&limit=${limit}`);
    }

    /**
     * Get a ride by ID
     */
    async getRideById(rideId: string): Promise<Ride> {
        return apiClient.get<Ride>(`/rides/${rideId}`);
    }

    /**
     * Book a new ride
     */
    async bookRide(rideData: Partial<Ride>): Promise<Ride> {
        return apiClient.post<Ride>('/rides', rideData);
    }

    /**
     * Update ride details
     */
    async updateRide(rideId: string, rideData: Partial<Ride>): Promise<Ride> {
        return apiClient.put<Ride>(`/rides/${rideId}`, rideData);
    }

    /**
     * Cancel a ride
     */
    async cancelRide(rideId: string): Promise<{ message: string; ride: Ride }> {
        return apiClient.put<{ message: string; ride: Ride }>(`/rides/${rideId}/cancel`);
    }

    /**
     * Complete a ride with optional rating and feedback
     */
    async completeRide(
        rideId: string,
        data: { rating?: number; feedback?: string; actualEndTime?: Date }
    ): Promise<{ message: string; ride: Ride }> {
        return apiClient.put<{ message: string; ride: Ride }>(`/rides/${rideId}/complete`, data);
    }

    /**
     * Get rides for a specific user
     */
    async getUserRides(userId: string): Promise<Ride[]> {
        return apiClient.get<Ride[]>(`/rides/user/${userId}`);
    }

    /**
     * Calculate ride fare
     */
    async calculateFare(
        pickupLocation: [number, number],
        dropLocation: [number, number],
        rideType: string
    ): Promise<{ distance: number; duration: number; fare: number }> {
        return apiClient.post<{ distance: number; duration: number; fare: number }>('/rides/calculate-fare', {
            pickupLocation,
            dropLocation,
            rideType
        });
    }

    /**
     * Apply coupon to ride
     */
    async applyCoupon(rideId: string, couponCode: string): Promise<Ride> {
        return apiClient.post<Ride>(`/rides/${rideId}/apply-coupon`, { couponCode });
    }
}

const rideService = new RideService();
export default rideService;