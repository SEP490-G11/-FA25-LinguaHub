
export interface Service {
    ServiceID: number;
    Title?: string;
    Duration?: number;
    Description?: string;
    Price?: number;
}

export interface ServiceBenefit {
    BenefitID: number;
    Title?: string;
    Description?: string;
    NumberUsage?: number;
    ServiceID?: number;
}

export interface UserService {
    UserServiceID: number;
    UserID: string;
    ServiceID?: number;
    StartDate?: string;
    IsActive: boolean;
    Title?: string;
    Duration?: number;
}

export interface UserServiceBenefit {
    UserServiceBenefitID: number;
    UserServiceID: number;
    Title?: string;
    Description?: string;
    NumberUsageRemaining?: number;
    NumberBooking?: number;
}


// 5. BOOKING & PAYMENT


export interface Schedule {
    ScheduleID: number;
    TutorID: number;
    StartTime: string;
    EndTime: string;
    IsAvailable: boolean;
}

export interface Booking {
    BookingID: number;
    UserID: string;
    TutorID: number;
    ScheduleID: number;
    UserServiceID?: number;
    Status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
    CreatedAt: string;
    UpdatedAt: string;
}

export interface Payment {
    PaymentID: number;
    Amount?: number;
    PaymentType: 'Course' | 'Service';
    PaymentMethod: 'PAYOS' | 'VNPAY' | 'BANK';
    EnrollmentID?: number;
    UserServiceID?: number;
    IsPaid: boolean;
    IsRefund: boolean;
    ReceivedID?: string;
    AmountPaid?: number;

}

export interface Feedback {
    FeedbackID: number;
    UserID: string;
    PaymentID: number;
    Rating: number;
    Comment?: string;
}
