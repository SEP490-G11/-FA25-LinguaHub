// ==========================================================
// API WRAPPER - TutorApproval (Phase 2: API Wrapper)
// ==========================================================
// This file switches between mock and real API
// Purpose: Easy transition from mock to real backend

import { Application } from '@/pages/Admin/TutorApproval/types';
import * as mockApi from './tutor-approval-api.mock';
// import { BaseRequest } from '@/config/axios.config'; // Uncomment when backend ready

// ==========================================================
// API Functions (Switch between Mock & Real)
// ==========================================================

/**
 * Get all pending tutor applications
 * 
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @param filters - Optional filters (search, status)
 * @returns Paginated list of applications
 * 
 * Database mapping:
 * - Table: TutorVerification
 * - Columns: UserID, Experience, Specialization, TeachingLanguage, Bio, 
 *           CertificateName, DocumentURL, Status, SubmittedAt
 */
export async function getPendingApplications(
  page: number = 1,
  limit: number = 10,
  filters?: {
    search?: string;
    status?: string;
  }
): Promise<{
  data: Application[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  // ===== MOCK API (Current) =====
  return mockApi.getPendingApplications({
    page,
    limit,
    search: filters?.search,
    status: filters?.status,
  });

  // ===== BACKEND API (Uncomment when ready) =====
  // const response = await BaseRequest.Get('/api/admin/tutor-applications', {
  //   params: {
  //     page,
  //     limit,
  //     search: filters?.search,
  //     status: filters?.status,
  //   },
  // });
  // return response.data;
}

/**
 * Get single application by ID
 * 
 * @param applicationId - TutorVerificationID
 * @returns Application details
 * 
 * Database mapping:
 * - Table: TutorVerification JOIN Users
 * - Joins UserID to get FullName and Email
 */
export async function getApplicationById(
  applicationId: string
): Promise<Application> {
  // ===== MOCK API (Current) =====
  return mockApi.getApplicationById(applicationId);

  // ===== BACKEND API (Uncomment when ready) =====
  // const response = await BaseRequest.Get(
  //   `/api/admin/tutor-applications/${applicationId}`
  // );
  // return response.data;
}

/**
 * Approve tutor application
 * 
 * @param applicationId - TutorVerificationID
 * @param adminNotes - Optional notes from admin
 * @returns Success response
 * 
 * Database action:
 * 1. Update TutorVerification: Status='Approved', ReviewedBy=AdminUserID, ReviewedAt=NOW()
 * 2. Create/Update Tutor record with verification data
 * 3. Update Users: Role='Tutor'
 */
export async function approveApplication(
  applicationId: string,
  adminNotes?: string
): Promise<{
  success: boolean;
  message: string;
  data: Application;
}> {
  // ===== MOCK API (Current) =====
  return mockApi.approveApplication(applicationId, adminNotes);

  // ===== BACKEND API (Uncomment when ready) =====
  // const response = await BaseRequest.Post(
  //   `/api/admin/tutor-applications/${applicationId}/approve`,
  //   {
  //     admin_notes: adminNotes,
  //   }
  // );
  // return response.data;
}

/**
 * Reject tutor application
 * 
 * @param applicationId - TutorVerificationID
 * @param rejectionReason - Required reason for rejection
 * @returns Success response
 * 
 * Database action:
 * 1. Update TutorVerification: Status='Rejected', ReviewedBy=AdminUserID, 
 *    ReviewedAt=NOW(), ReasonForReject=rejectionReason
 */
export async function rejectApplication(
  applicationId: string,
  rejectionReason: string
): Promise<{
  success: boolean;
  message: string;
  data: Application;
}> {
  // ===== MOCK API (Current) =====
  return mockApi.rejectApplication(applicationId, rejectionReason);

  // ===== BACKEND API (Uncomment when ready) =====
  // const response = await BaseRequest.Post(
  //   `/api/admin/tutor-applications/${applicationId}/reject`,
  //   {
  //     rejection_reason: rejectionReason,
  //   }
  // );
  // return response.data;
}

// ==========================================================
// Type Definitions for API Documentation (Phase 7)
// ==========================================================

/**
 * API DOCUMENTATION FOR BACKEND TEAM
 * 
 * Endpoint 1: GET /api/admin/tutor-applications
 * -------------------------------------------
 * Description: Get paginated list of tutor applications
 * Query Params:
 *   - page: number (default: 1)
 *   - limit: number (default: 10)
 *   - search: string (optional) - search in name, email, languages
 *   - status: 'pending' | 'approved' | 'rejected' (optional)
 * 
 * Response Format:
 * {
 *   data: Application[],
 *   total: number,
 *   page: number,
 *   limit: number,
 *   totalPages: number
 * }
 * 
 * SQL Query Example:
 * SELECT 
 *   tv.TutorVerificationID as id,
 *   u.FullName as applicantName,
 *   u.Email as applicantEmail,
 *   tv.TeachingLanguage as teachingLanguages,
 *   tv.Specialization as specialization,
 *   tv.Experience as experience,
 *   tv.Bio as bio,
 *   tv.CertificateName as certificateName,
 *   tv.DocumentURL as certificateUrl,
 *   tv.Status as status,
 *   DATE_FORMAT(tv.SubmittedAt, '%Y-%m-%d') as appliedDate
 * FROM TutorVerification tv
 * JOIN Users u ON tv.UserID = u.UserID
 * WHERE tv.Status = ? (if status filter)
 * AND (u.FullName LIKE ? OR u.Email LIKE ?) (if search)
 * ORDER BY tv.SubmittedAt DESC
 * LIMIT ? OFFSET ?
 * 
 * -------------------------------------------
 * 
 * Endpoint 2: GET /api/admin/tutor-applications/:id
 * -------------------------------------------
 * Description: Get single application details
 * Path Params:
 *   - id: TutorVerificationID
 * 
 * Response Format: Application object
 * 
 * -------------------------------------------
 * 
 * Endpoint 3: POST /api/admin/tutor-applications/:id/approve
 * -------------------------------------------
 * Description: Approve tutor application
 * Path Params:
 *   - id: TutorVerificationID
 * Body:
 * {
 *   admin_notes: string (optional)
 * }
 * 
 * Database Actions:
 * 1. UPDATE TutorVerification 
 *    SET Status='Approved', ReviewedBy=:adminUserId, ReviewedAt=NOW()
 *    WHERE TutorVerificationID=:id
 * 
 * 2. INSERT INTO Tutor (UserID, Experience, Specialization, TeachingLanguage, Bio, Status)
 *    SELECT UserID, Experience, Specialization, TeachingLanguage, Bio, 'Approved'
 *    FROM TutorVerification WHERE TutorVerificationID=:id
 *    ON DUPLICATE KEY UPDATE ... (if tutor exists)
 * 
 * 3. UPDATE Users SET Role='Tutor' WHERE UserID=(
 *      SELECT UserID FROM TutorVerification WHERE TutorVerificationID=:id
 *    )
 * 
 * Response Format:
 * {
 *   success: true,
 *   message: 'Application approved successfully',
 *   data: Application object
 * }
 * 
 * -------------------------------------------
 * 
 * Endpoint 4: POST /api/admin/tutor-applications/:id/reject
 * -------------------------------------------
 * Description: Reject tutor application
 * Path Params:
 *   - id: TutorVerificationID
 * Body:
 * {
 *   rejection_reason: string (required)
 * }
 * 
 * Database Actions:
 * 1. UPDATE TutorVerification 
 *    SET Status='Rejected', 
 *        ReviewedBy=:adminUserId, 
 *        ReviewedAt=NOW(),
 *        ReasonForReject=:rejectionReason
 *    WHERE TutorVerificationID=:id
 * 
 * Response Format:
 * {
 *   success: true,
 *   message: 'Application rejected successfully',
 *   data: Application object
 * }
 * 
 * -------------------------------------------
 * 
 * Error Format (All Endpoints):
 * {
 *   error: string,
 *   message: string,
 *   statusCode: number
 * }
 * 
 * Auth Required: Yes (Admin role only)
 * Headers:
 *   - Authorization: Bearer {token}
 */

export interface ApiDocumentation {
  endpoints: {
    getPendingApplications: {
      method: 'GET';
      url: '/api/admin/tutor-applications';
      queryParams: {
        page?: number;
        limit?: number;
        search?: string;
        status?: 'pending' | 'approved' | 'rejected';
      };
      response: {
        data: Application[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
    getApplicationById: {
      method: 'GET';
      url: '/api/admin/tutor-applications/:id';
      pathParams: { id: string };
      response: Application;
    };
    approveApplication: {
      method: 'POST';
      url: '/api/admin/tutor-applications/:id/approve';
      pathParams: { id: string };
      body: { admin_notes?: string };
      response: {
        success: boolean;
        message: string;
        data: Application;
      };
    };
    rejectApplication: {
      method: 'POST';
      url: '/api/admin/tutor-applications/:id/reject';
      pathParams: { id: string };
      body: { rejection_reason: string };
      response: {
        success: boolean;
        message: string;
        data: Application;
      };
    };
  };
}
