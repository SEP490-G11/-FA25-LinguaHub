import { TutorApplicationFormData, ApplicationStatus, SubmitApplicationResponse } from '../pages/ApplyTutor/types';

// ==========================================================
// Phase 2: Mock API Implementation
// Simulates backend API for development and testing
// ==========================================================

// Simulated network delay (800-1200ms)
const delay = () => new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

// In-memory storage for mock applications
let mockApplicationsStore: Record<string, ApplicationStatus> = {};

// ==========================================================
// Mock API Functions
// ==========================================================

/**
 * Submit a new tutor application
 */
export const submitApplication = async (
  userId: string,
  data: TutorApplicationFormData
): Promise<SubmitApplicationResponse> => {
  console.log('🚀 [MOCK API] Submitting tutor application...', { userId, data });
  
  await delay();

  // Check if user already has an application
  if (mockApplicationsStore[userId]) {
    throw new Error('You have already submitted an application');
  }

  // Create new application
  const newApplication: ApplicationStatus = {
    id: `app-${Date.now()}`,
    userId: userId,
    status: 'Pending',
    submittedAt: new Date().toISOString(),
    teachingLanguages: data.teachingLanguages,
    specialization: data.specialization,
    experience: data.experience,
    bio: data.bio,
    certificateName: data.certificateName,
    certificateUrl: data.certificateUrl,
  };

  // Store in mock database
  mockApplicationsStore[userId] = newApplication;

  console.log('✅ [MOCK API] Application submitted successfully:', newApplication);

  return {
    success: true,
    message: 'Application submitted successfully',
    data: newApplication,
  };
};

/**
 * Get application status for a user
 */
export const getApplicationStatus = async (userId: string): Promise<ApplicationStatus> => {
  console.log('🔍 [MOCK API] Fetching application status for user:', userId);
  
  await delay();

  const application = mockApplicationsStore[userId];

  if (!application) {
    console.log('❌ [MOCK API] No application found for user:', userId);
    throw new Error('No application found');
  }

  console.log('✅ [MOCK API] Application found:', application);
  return application;
};

// ==========================================================
// Browser Console Debug Tools
// Access these functions in browser console for testing
// ==========================================================

declare global {
  interface Window {
    __mockApplyTutorAPI: {
      getApplications: () => Record<string, ApplicationStatus>;
      getApplicationByUser: (userId: string) => ApplicationStatus | undefined;
      addSampleApplication: (userId: string) => void;
      approveApplication: (userId: string, comment?: string) => void;
      rejectApplication: (userId: string, reason: string) => void;
      clearApplication: (userId: string) => void;
      clearAll: () => void;
      loadSamples: () => void;
    };
  }
}

// Initialize debug tools
if (typeof window !== 'undefined') {
  window.__mockApplyTutorAPI = {
    // Get all applications
    getApplications: () => {
      console.log('📋 All mock applications:', mockApplicationsStore);
      return mockApplicationsStore;
    },

    // Get specific application
    getApplicationByUser: (userId: string) => {
      const app = mockApplicationsStore[userId];
      console.log(`🔍 Application for user ${userId}:`, app || 'Not found');
      return app;
    },

    // Add sample application
    addSampleApplication: (userId: string) => {
      mockApplicationsStore[userId] = {
        id: `app-${Date.now()}`,
        userId: userId,
        status: 'Pending',
        submittedAt: new Date().toISOString(),
        teachingLanguages: ['English', 'Korean'],
        specialization: 'Business English & IELTS Preparation',
        experience: 5,
        bio: 'Experienced English teacher with 5 years of teaching experience. Specializing in Business English and IELTS preparation. I have helped over 200 students achieve their language learning goals.',
        certificateName: 'TESOL Certificate',
        certificateUrl: 'https://example.com/certificate.pdf',
      };
      console.log('✅ Sample application added for user:', userId);
      return mockApplicationsStore[userId];
    },

    // Approve application
    approveApplication: (userId: string, comment?: string) => {
      const app = mockApplicationsStore[userId];
      if (!app) {
        console.error('❌ No application found for user:', userId);
        return;
      }
      app.status = 'Approved';
      app.reviewedAt = new Date().toISOString();
      if (comment) {
        app.reasonForReject = comment; // Can be used for approval comments too
      }
      console.log('✅ Application approved for user:', userId);
      return app;
    },

    // Reject application
    rejectApplication: (userId: string, reason: string) => {
      const app = mockApplicationsStore[userId];
      if (!app) {
        console.error('❌ No application found for user:', userId);
        return;
      }
      app.status = 'Rejected';
      app.reviewedAt = new Date().toISOString();
      app.reasonForReject = reason;
      console.log('❌ Application rejected for user:', userId);
      return app;
    },

    // Clear specific application
    clearApplication: (userId: string) => {
      delete mockApplicationsStore[userId];
      console.log('🗑️  Application cleared for user:', userId);
    },

    // Clear all applications
    clearAll: () => {
      mockApplicationsStore = {};
      console.log('🗑️  All applications cleared');
    },

    // Load sample data
    loadSamples: () => {
      mockApplicationsStore = {
        '1': {
          id: 'app-001',
          userId: '1',
          status: 'Pending',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          teachingLanguages: ['English', 'Korean'],
          specialization: 'Business English & IELTS Preparation',
          experience: 5,
          bio: 'Experienced English teacher with 5 years of teaching experience in international schools. Specializing in Business English and IELTS preparation. I have successfully helped over 200 students achieve their target IELTS scores and improve their professional communication skills.',
          certificateName: 'TESOL Certificate',
          certificateUrl: 'https://example.com/tesol-certificate.pdf',
        },
        '2': {
          id: 'app-002',
          userId: '2',
          status: 'Approved',
          submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          teachingLanguages: ['Japanese', 'English'],
          specialization: 'Japanese for Beginners',
          experience: 3,
          bio: 'Native Japanese speaker with 3 years of teaching experience. I specialize in teaching Japanese to complete beginners using fun and interactive methods. My students love learning about Japanese culture while mastering the language.',
          certificateName: 'Japanese Language Teaching Certificate',
          certificateUrl: 'https://example.com/jlpt-certificate.pdf',
        },
        '3': {
          id: 'app-003',
          userId: '3',
          status: 'Rejected',
          submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          reviewedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
          reasonForReject: 'Insufficient teaching experience and certificate provided is not valid. Please gain more experience and provide a recognized teaching certificate.',
          teachingLanguages: ['Spanish'],
          specialization: 'Conversational Spanish',
          experience: 1,
          bio: 'Spanish language enthusiast with 1 year of informal teaching experience.',
          certificateName: 'Online Spanish Course Certificate',
          certificateUrl: 'https://example.com/spanish-cert.pdf',
        },
      };
      console.log('📦 Sample applications loaded:', mockApplicationsStore);
    },
  };

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🧪 Apply Tutor Mock API - Debug Tools Available            ║
╚══════════════════════════════════════════════════════════════╝

Open browser console and use these commands:

📋 View all applications:
   window.__mockApplyTutorAPI.getApplications()

🔍 Get specific application:
   window.__mockApplyTutorAPI.getApplicationByUser('1')

➕ Add sample application:
   window.__mockApplyTutorAPI.addSampleApplication('1')

✅ Approve application:
   window.__mockApplyTutorAPI.approveApplication('1', 'Great credentials!')

❌ Reject application:
   window.__mockApplyTutorAPI.rejectApplication('1', 'Insufficient experience')

🗑️  Clear application:
   window.__mockApplyTutorAPI.clearApplication('1')

🗑️  Clear all:
   window.__mockApplyTutorAPI.clearAll()

📦 Load sample data:
   window.__mockApplyTutorAPI.loadSamples()

──────────────────────────────────────────────────────────────
`);
}

export default {
  submitApplication,
  getApplicationStatus,
};
