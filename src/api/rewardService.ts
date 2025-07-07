import apiClient from './apiClient';
import { Reward, PaginatedResponse } from '../types/api';

/**
 * Reward service for handling reward-related API calls
 */
class RewardService {
    /**
     * Get all rewards (paginated)
     */
    async getRewards(page = 1, limit = 10): Promise<PaginatedResponse<Reward>> {
        return apiClient.get<PaginatedResponse<Reward>>(`/rewards?page=${page}&limit=${limit}`);
    }

    /**
     * Get a reward by ID
     */
    async getRewardById(rewardId: string): Promise<Reward> {
        return apiClient.get<Reward>(`/rewards/${rewardId}`);
    }

    /**
     * Get available rewards for a user based on their points
     */
    async getAvailableRewards(userId: string): Promise<Reward[]> {
        return apiClient.get<Reward[]>(`/rewards/available/${userId}`);
    }

    /**
     * Redeem a reward
     */
    async redeemReward(rewardId: string, userId: string): Promise<{
        message: string;
        reward: Reward;
        remainingPoints: number;
    }> {
        return apiClient.post<{
            message: string;
            reward: Reward;
            remainingPoints: number;
        }>('/rewards/redeem', { rewardId, userId });
    }

    /**
     * Update redemption status
     */
    async updateRedemptionStatus(
        rewardId: string,
        userId: string,
        status: 'Pending' | 'Redeemed' | 'Expired'
    ): Promise<{
        message: string;
        redemption: {
            user: string;
            redeemedAt: Date;
            status: string;
        };
    }> {
        return apiClient.put<{
            message: string;
            redemption: {
                user: string;
                redeemedAt: Date;
                status: string;
            };
        }>(`/rewards/redeem/${rewardId}/user/${userId}`, { status });
    }

    /**
     * Get rewards redeemed by a user
     */
    async getUserRedeemedRewards(userId: string): Promise<Reward[]> {
        return apiClient.get<Reward[]>(`/rewards/user/${userId}/redeemed`);
    }

    /**
     * Create a new reward (admin only)
     */
    async createReward(rewardData: Partial<Reward>): Promise<Reward> {
        return apiClient.post<Reward>('/rewards', rewardData);
    }

    /**
     * Update a reward (admin only)
     */
    async updateReward(rewardId: string, rewardData: Partial<Reward>): Promise<Reward> {
        return apiClient.put<Reward>(`/rewards/${rewardId}`, rewardData);
    }

    /**
     * Delete a reward (admin only)
     */
    async deleteReward(rewardId: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/rewards/${rewardId}`);
    }
}

const rewardService = new RewardService();
export default rewardService;