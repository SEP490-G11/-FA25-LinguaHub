import axios from '@/config/axiosConfig';
import { Application } from './types';

/**
 * Admin API for Tutor Application Management
 * Real API implementation
 */
export const tutorApprovalApi = {
  /**
   * Get all pending tutor applications
   * Endpoint: GET /admin/tutors/applications/pending
   */
  getPendingApplications: async (
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
  }> => {
    try {
      console.log('🔍 Fetching pending applications...');
      
      // Backend endpoint: GET /admin/tutors/applications/pending
      const response = await axios.get('/admin/tutors/applications/pending');
      
      console.log('📊 Backend response:', response?.data);
      
      // Backend returns array directly
      let backendData = response?.data?.result || response?.data || [];
      
      // Ensure it's an array
      if (!Array.isArray(backendData)) {
        backendData = [];
      }
      
      // Transform backend data to match Application interface
      let applications: Application[] = backendData.map((item: any) => ({
        // Core fields
        id: item.verificationId?.toString() || '',
        verificationId: item.verificationId,
        tutorId: item.tutorId,
        userId: item.userId,
        
        // User info
        applicantName: item.userName || '',
        applicantEmail: item.userEmail || '',
        avatarURL: item.avatarURL || '',
        country: item.country || '',
        userPhone: item.userPhone || '',
        
        // Teaching info
        teachingLanguages: item.teachingLanguage 
          ? item.teachingLanguage.split(',').map((l: string) => l.trim())
          : [],
        specialization: item.specialization || '',
        pricePerHour: item.pricePerHour || 0,
        
        // These fields are only in detail view, set defaults for list
        experience: 0,
        bio: '',
        certificateName: '',
        certificateUrl: '',
        
        // Status info
        status: (item.status?.toLowerCase() || 'pending') as 'pending' | 'approved' | 'rejected',
        appliedDate: item.submittedAt || new Date().toISOString(),
        reviewedBy: item.reviewedBy || '',
        reviewedAt: item.reviewedAt || '',
        reasonForReject: item.reasonForReject || '',
      }));

      // Apply client-side filters
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        applications = applications.filter(
          (app) =>
            app.applicantName.toLowerCase().includes(searchLower) ||
            app.applicantEmail.toLowerCase().includes(searchLower) ||
            app.specialization.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.status && filters.status !== '') {
        applications = applications.filter(
          (app) => app.status === filters.status
        );
      }

      // Calculate pagination
      const total = applications.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedApplications = applications.slice(startIndex, startIndex + limit);

      console.log('✅ Mapped applications:', paginatedApplications);

      return {
        data: paginatedApplications,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error: any) {
      console.error('❌ Error fetching tutor applications:', error);
      throw new Error(
        error?.response?.data?.message || 
        error.message || 
        'Failed to fetch tutor applications'
      );
    }
  },

  /**
   * Get single application by ID with full details
   * Endpoint: GET /admin/tutors/applications/:verificationId
   */
  getApplicationById: async (applicationId: string): Promise<Application> => {
    try {
      console.log('🔍 Fetching application detail:', applicationId);
      
      const response = await axios.get(`/admin/tutors/applications/${applicationId}`);
      const item = response?.data?.result || response?.data;

      console.log('📊 Application detail response:', item);

      // Extract first certificate for backward compatibility
      const firstCertificate = item.certificates?.[0];

      return {
        // Core fields
        id: item.verificationId?.toString() || applicationId,
        verificationId: item.verificationId,
        tutorId: item.tutorId,
        userId: item.userId,
        
        // User info
        applicantName: item.userName || '',
        applicantEmail: item.userEmail || '',
        userPhone: item.userPhone || '',
        
        // Teaching info
        teachingLanguages: item.teachingLanguage 
          ? item.teachingLanguage.split(',').map((l: string) => l.trim())
          : [],
        specialization: item.specialization || '',
        experience: item.experience || 0,
        bio: item.bio || '',
        
        // Certificates
        certificates: item.certificates || [],
        certificateName: firstCertificate?.certificateName || '',
        certificateUrl: firstCertificate?.documentUrl || '',
        
        // Status info
        status: (item.status?.toLowerCase() || 'pending') as 'pending' | 'approved' | 'rejected',
        appliedDate: item.submittedAt || new Date().toISOString(),
        reviewedBy: item.reviewedBy || '',
        reviewedAt: item.reviewedAt || '',
        reasonForReject: item.reasonForReject || '',
      };
    } catch (error: any) {
      console.error('❌ Error fetching application detail:', error);
      throw new Error(
        error?.response?.data?.message || 
        error.message || 
        'Failed to fetch application details'
      );
    }
  },

  /**
   * Approve tutor application
   * Endpoint: POST /admin/tutors/applications/:verificationId/approve
   */
  approveApplication: async (
    applicationId: string,
    _adminNotes?: string // Prefix with _ to indicate intentionally unused
  ): Promise<{
    success: boolean;
    message: string;
    data: Application;
  }> => {
    try {
      console.log('✅ Approving application:', applicationId);
      
      // Backend doesn't require body for approve
      const response = await axios.post(
        `/admin/tutors/applications/${applicationId}/approve`
      );

      console.log('📊 Approve response:', response?.data);

      return {
        success: true,
        message: 'Application approved successfully',
        data: response?.data?.result || response?.data,
      };
    } catch (error: any) {
      console.error('❌ Error approving application:', error);
      throw new Error(
        error?.response?.data?.message || 
        error.message || 
        'Failed to approve application'
      );
    }
  },

  /**
   * Reject tutor application
   * Endpoint: POST /admin/tutors/applications/:verificationId/reject
   */
  rejectApplication: async (
    applicationId: string,
    rejectionReason: string
  ): Promise<{
    success: boolean;
    message: string;
    data: Application;
  }> => {
    try {
      console.log('❌ Rejecting application:', applicationId, 'Reason:', rejectionReason);
      
      // Backend expects: { reason: string }
      const response = await axios.post(
        `/admin/tutors/applications/${applicationId}/reject`,
        { reason: rejectionReason }
      );

      console.log('📊 Reject response:', response?.data);

      return {
        success: true,
        message: 'Application rejected successfully',
        data: response?.data?.result || response?.data,
      };
    } catch (error: any) {
      console.error('❌ Error rejecting application:', error);
      throw new Error(
        error?.response?.data?.message || 
        error.message || 
        'Failed to reject application'
      );
    }
  },
};

export default tutorApprovalApi;
