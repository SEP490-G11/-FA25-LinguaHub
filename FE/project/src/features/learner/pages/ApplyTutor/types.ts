// ==========================================================
// ApplyTutor Types - Matches Database Schema
// ==========================================================

/**
 * Tutor Application Form Data
 * Maps to TutorVerification table in database
 */
export interface TutorApplicationFormData {
  teachingLanguages: string[];      // TutorVerification.TeachingLanguage (comma-separated or JSON)
  specialization: string;           // TutorVerification.Specialization
  experience: number;               // TutorVerification.Experience (years)
  bio: string;                      // TutorVerification.Bio
  certificateName: string;          // TutorVerification.CertificateName
  certificateUrl: string;           // TutorVerification.DocumentURL
}

/**
 * Application Status from Backend
 * After form submission, shows current status
 */
export interface ApplicationStatus {
  id: string;                       // TutorVerificationID
  userId: string;                   // UserID
  status: 'Pending' | 'Approved' | 'Rejected'; // TutorVerification.Status
  submittedAt: string;              // TutorVerification.SubmittedAt
  reviewedAt?: string;              // TutorVerification.ReviewedAt
  reasonForReject?: string;         // TutorVerification.ReasonForReject
  teachingLanguages: string[];
  specialization: string;
  experience: number;
  bio: string;
  certificateName: string;
  certificateUrl: string;
}

/**
 * API Response after submission
 */
export interface SubmitApplicationResponse {
  success: boolean;
  message: string;
  data: ApplicationStatus;
}
