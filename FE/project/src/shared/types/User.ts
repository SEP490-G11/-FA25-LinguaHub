export interface User {
    userID: string;
    username: string;
    email: string;
    passwordHash: string;
    role: 'Admin' | 'Tutor' | 'Learner';
    fullName?: string;
    avatarURL?: string;
    gender?: 'Male' | 'Female' | 'Other';
    dob?: string;
    phone?: string;
    country?: string;
    address?: string;
    bio?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Verification {
    VerificationID: number;
    UserID: string;
    Type: 'Email' | 'Phone' | 'OTP';
    Code: string;
    ExpiredAt?: string;
    IsVerified: boolean;
}
