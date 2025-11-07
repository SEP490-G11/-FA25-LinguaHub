export interface Tutor {
    TutorID: number;
    UserID: string;
    Experience: number;
    Specialization?: string;
    TeachingLanguage?: string;
    Bio?: string;
    Rating: number;
    Status: 'Pending' | 'Approved' | 'Suspended';
}

export interface TutorVerification {
    TutorVerificationID: number;
    UserID: string;
    Experience: number;
    Specialization?: string;
    TeachingLanguage?: string;
    Bio?: string;
    CertificateName?: string;
    DocumentURL?: string;
    Status: 'Pending' | 'Approved' | 'Rejected';
    SubmittedAt: string;
    ReviewedBy?: string;
    ReviewedAt?: string;
    ReasonForReject?: string;
}
