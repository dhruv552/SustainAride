import apiClient from './apiClient';
import { Coupon, PaginatedResponse } from '../types/api';

/**
 * Coupon service for handling coupon-related API calls
 */
class CouponService {
    /**
     * Get all coupons (paginated)
     */
    async getCoupons(page = 1, limit = 10): Promise<PaginatedResponse<Coupon>> {
        return apiClient.get<PaginatedResponse<Coupon>>(`/coupons?page=${page}&limit=${limit}`);
    }

    /**
     * Get a coupon by ID
     */
    async getCouponById(couponId: string): Promise<Coupon> {
        return apiClient.get<Coupon>(`/coupons/${couponId}`);
    }

    /**
     * Validate a coupon code
     */
    async validateCoupon(
        code: string,
        data?: {
            userId?: string;
            rideType?: string;
            rideValue?: number
        }
    ): Promise<{
        valid: boolean;
        coupon?: Coupon;
        discountAmount?: number;
        message: string;
    }> {
        return apiClient.post<{
            valid: boolean;
            coupon?: Coupon;
            discountAmount?: number;
            message: string;
        }>('/coupons/validate', { code, ...data });
    }

    /**
     * Apply a coupon to a user
     */
    async applyCoupon(couponId: string, userId: string): Promise<{
        message: string;
        user: string;
        coupon: string;
    }> {
        return apiClient.post<{
            message: string;
            user: string;
            coupon: string;
        }>('/coupons/apply', { couponId, userId });
    }

    /**
     * Get active coupons for a user
     */
    async getActiveUserCoupons(userId: string): Promise<Coupon[]> {
        try {
            console.log('Fetching active coupons for user:', userId);
            // Add explicit timeout to ensure we wait long enough for response
            const response = await apiClient.get<Coupon[]>(`/coupons/user/${userId}/active`, {
                timeout: 10000 // 10 seconds timeout
            });

            console.log('Coupons fetched successfully:', response);
            return response;
        } catch (error) {
            console.error('Error fetching coupons:', error);
            // Return default coupons for testing if API fails
            return this.getDefaultCoupons();
        }
    }

    /**
     * Fallback to provide default coupons when API fails
     * This ensures users always see some coupons regardless of backend issues
     */
    getDefaultCoupons(): Coupon[] {
        const now = new Date();
        const futureDate = new Date(now);
        futureDate.setMonth(now.getMonth() + 3);

        return [
            {
                _id: 'default1',
                code: 'GreenStart10',
                description: '₹10 off on the first CNG or Electric ride booked via SustainAride.',
                discountType: 'Fixed',
                discountValue: 10,
                minRideValue: 50,
                validFrom: now,
                validUntil: futureDate,
                usageLimit: 1,
                usageCount: 0,
                isActive: true,
                applicableRideTypes: ['Electric', 'CNG'],
                userRestriction: 'New',
                users: [],
                createdAt: now,
                updatedAt: now
            },
            {
                _id: 'default2',
                code: 'ElectricSaver30',
                description: '₹30 discount applicable for electric rides above 10 km.',
                discountType: 'Fixed',
                discountValue: 30,
                minRideValue: 0,
                validFrom: now,
                validUntil: futureDate,
                usageLimit: 2,
                usageCount: 0,
                isActive: true,
                applicableRideTypes: ['Electric'],
                userRestriction: 'All',
                users: [],
                createdAt: now,
                updatedAt: now
            },
            {
                _id: 'default3',
                code: 'EcoRide20',
                description: '₹20 cashback will be credited to the user\'s wallet within 24 hours after the 3rd shared ride.',
                discountType: 'Cashback',
                discountValue: 20,
                minRideValue: 30,
                validFrom: now,
                validUntil: futureDate,
                usageLimit: 1,
                usageCount: 0,
                isActive: true,
                applicableRideTypes: ['Shared'],
                userRestriction: 'All',
                users: [],
                createdAt: now,
                updatedAt: now
            }
        ];
    }

    /**
     * Create a new coupon (admin only)
     */
    async createCoupon(couponData: Partial<Coupon>): Promise<Coupon> {
        return apiClient.post<Coupon>('/coupons', couponData);
    }

    /**
     * Update a coupon (admin only)
     */
    async updateCoupon(couponId: string, couponData: Partial<Coupon>): Promise<Coupon> {
        return apiClient.put<Coupon>(`/coupons/${couponId}`, couponData);
    }

    /**
     * Delete a coupon (admin only)
     */
    async deleteCoupon(couponId: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/coupons/${couponId}`);
    }
}

const couponService = new CouponService();
export default couponService;