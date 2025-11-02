export interface User {
    UserID: string;
    email: string;
    PasswordHash: string;
    Role: 'Admin' | 'Tutor' | 'Learner';
    fullName?: string;
    AvatarURL?: string;
    Gender?: 'Male' | 'Female' | 'Other';
    DOB?: string;
    Phone?: string;
    Country?: string;
    Address?: string;
    Bio?: string;
    IsActive: boolean;
    CreatedAt: string;
    UpdatedAt: string;
}

export interface Verification {
    VerificationID: number;
    UserID: string;
    Type: 'Email' | 'Phone' | 'OTP';
    Code: string;
    ExpiredAt?: string;
    IsVerified: boolean;
}