import { TutorApplicationFormData, ApplicationStatus, SubmitApplicationResponse } from '../pages/ApplyTutor/types';
import mockAPI from './tutor-application-api.mock';

// ==========================================================
// Phase 2: API Wrapper - Switch between Mock and Real API
// ==========================================================

/**
 * Configuration: Toggle between mock and real API
 * Set to false when backend is ready
 */
const USE_MOCK_API = true;

/**
 * Real API implementation (to be connected to backend)
 */
const realAPI = {
  /**
   * POST /api/tutor-applications
   * Submit a new tutor application
   */
  submitApplication: async (
    userId: string,
    data: TutorApplicationFormData
  ): Promise<SubmitApplicationResponse> => {
    const response = await fetch('/api/tutor-applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers here
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        ...data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit application');
    }

    return response.json();
  },

  /**
   * GET /api/tutor-applications/:userId
   * Get application status for a user
   */
  getApplicationStatus: async (userId: string): Promise<ApplicationStatus> => {
    const response = await fetch(`/api/tutor-applications/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers here
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No application found');
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch application status');
    }

    return response.json();
  },
};

/**
 * Export API based on configuration
 */
export const tutorApplicationAPI = USE_MOCK_API ? mockAPI : realAPI;

/**
 * Switch to real API when backend is ready
 * Simply change USE_MOCK_API to false above
 */
console.log(
  `🔧 Tutor Application API Mode: ${USE_MOCK_API ? 'MOCK' : 'REAL'}`
);
