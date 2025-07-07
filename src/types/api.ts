// MongoDB model interfaces

export interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    joinDate: Date;
    sustainPoints: number;
    rides: string[] | Ride[];
    coupons: string[] | Coupon[];
    rewards: string[] | Reward[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Location {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
}

export interface Ride {
    _id: string;
    user: string | User;
    pickupLocation: Location;
    dropLocation: Location;
    distance: number;
    duration: number;
    rideType: 'Standard' | 'Premium' | 'Carpool' | 'Electric';
    fare: number;
    sustainPointsEarned: number;
    status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
    paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
    paymentMethod: 'Cash' | 'Card' | 'Wallet' | 'UPI';
    scheduledTime: Date;
    actualStartTime?: Date;
    actualEndTime?: Date;
    driverId?: string;
    driverName?: string;
    vehicleDetails?: string;
    rating?: number;
    feedback?: string;
    couponApplied?: string | Coupon;
    createdAt: Date;
    updatedAt: Date;
}

export interface Coupon {
    _id: string;
    code: string;
    description: string;
    discountType: 'Percentage' | 'Fixed';
    discountValue: number;
    maxDiscount?: number;
    minRideValue: number;
    validFrom: Date;
    validUntil: Date;
    usageLimit: number;
    usageCount: number;
    isActive: boolean;
    applicableRideTypes: ('Standard' | 'Premium' | 'Carpool' | 'Electric' | 'All')[];
    userRestriction: 'New' | 'Existing' | 'All';
    users: {
        user: string | User;
        timesUsed: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Reward {
    _id: string;
    name: string;
    description: string;
    pointsRequired: number;
    rewardType: 'Discount' | 'FreeRide' | 'Merchandise' | 'PartnerOffer';
    rewardValue?: number;
    validFrom: Date;
    validUntil: Date;
    imageUrl?: string;
    isActive: boolean;
    redemptionLimit: number;
    redemptionCount: number;
    redeemedBy: {
        user: string | User;
        redeemedAt: Date;
        status: 'Pending' | 'Redeemed' | 'Expired';
    }[];
    termsAndConditions?: string;
    partnerInfo?: {
        name: string;
        logo?: string;
        website?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

// Auth interfaces
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

// API response interfaces
export interface ApiResponse<T> {
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}