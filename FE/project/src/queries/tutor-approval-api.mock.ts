// ==========================================================
// MOCK API - TutorApproval (Phase 2: Mock API Layer)
// ==========================================================
// This file simulates backend API calls with mock data
// Remove this file when backend is ready

import { Application } from '@/pages/Admin/TutorApproval/types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage (simulates database)
let mockApplications: Application[] = [
  {
    id: '1',
    applicantName: 'Nguyễn Văn A',
    applicantEmail: 'nguyenvana@email.com',
    teachingLanguages: ['English', 'Vietnamese'],
    specialization: 'Business English',
    experience: 5,
    bio: 'I have been teaching English for 5 years with a focus on business communication. I hold a TESOL certificate and have worked with students from various countries.',
    certificateName: 'TESOL Certificate',
    certificateUrl: 'https://example.com/cert1.pdf',
    status: 'pending',
    appliedDate: '2025-10-28',
  },
  {
    id: '2',
    applicantName: 'Trần Thị B',
    applicantEmail: 'tranthib@email.com',
    teachingLanguages: ['Korean', 'Vietnamese'],
    specialization: 'Conversational Korean',
    experience: 3,
    bio: 'Native Korean speaker with 3 years of teaching experience. I specialize in helping students improve their conversational skills through interactive lessons.',
    certificateName: 'Korean Language Teaching Certificate',
    certificateUrl: 'https://example.com/cert2.pdf',
    status: 'pending',
    appliedDate: '2025-10-27',
  },
  {
    id: '3',
    applicantName: 'Lê Minh C',
    applicantEmail: 'leminhc@email.com',
    teachingLanguages: ['Japanese', 'Vietnamese', 'English'],
    specialization: 'JLPT Preparation',
    experience: 7,
    bio: 'Experienced Japanese language teacher with JLPT N1 certification. I have helped over 100 students pass their JLPT exams with high scores.',
    certificateName: 'JLPT N1 Certificate',
    certificateUrl: 'https://example.com/cert3.pdf',
    status: 'approved',
    appliedDate: '2025-10-25',
  },
  {
    id: '4',
    applicantName: 'Phạm Thị D',
    applicantEmail: 'phamthid@email.com',
    teachingLanguages: ['French', 'Vietnamese'],
    specialization: 'French for Beginners',
    experience: 4,
    bio: 'French literature graduate with 4 years of teaching experience. I focus on making French learning fun and accessible for beginners.',
    certificateName: 'DELF B2 Certificate',
    certificateUrl: 'https://example.com/cert4.pdf',
    status: 'pending',
    appliedDate: '2025-10-26',
  },
  {
    id: '5',
    applicantName: 'Hoàng Văn E',
    applicantEmail: 'hoangvane@email.com',
    teachingLanguages: ['Chinese', 'Vietnamese'],
    specialization: 'HSK Preparation',
    experience: 2,
    bio: 'Recent graduate with HSK 6 certification. I am passionate about teaching Chinese and helping students prepare for HSK exams.',
    certificateName: 'HSK 6 Certificate',
    certificateUrl: 'https://example.com/cert5.pdf',
    status: 'rejected',
    appliedDate: '2025-10-24',
  },
  {
    id: '6',
    applicantName: 'Vũ Thị F',
    applicantEmail: 'vuthif@email.com',
    teachingLanguages: ['Spanish', 'English', 'Vietnamese'],
    specialization: 'Spanish Grammar and Conversation',
    experience: 6,
    bio: 'Certified Spanish teacher with 6 years of international teaching experience. I specialize in grammar and conversational Spanish for all levels.',
    certificateName: 'DELE C1 Certificate',
    certificateUrl: 'https://example.com/cert6.pdf',
    status: 'pending',
    appliedDate: '2025-10-29',
  },
];

// ==========================================================
// Mock API Functions
// ==========================================================

/**
 * Get all tutor applications with filtering
 */
export async function getPendingApplications(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  console.log('[MOCK API] getPendingApplications called with:', params);
  await delay(800);

  let filtered = [...mockApplications];

  // Filter by search query
  if (params?.search) {
    const query = params.search.toLowerCase();
    filtered = filtered.filter(
      (app) =>
        app.applicantName.toLowerCase().includes(query) ||
        app.applicantEmail.toLowerCase().includes(query) ||
        app.teachingLanguages.some((lang) => lang.toLowerCase().includes(query))
    );
  }

  // Filter by status
  if (params?.status) {
    filtered = filtered.filter((app) => app.status === params.status);
  }

  // Pagination
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filtered.slice(startIndex, endIndex);

  console.log(`[MOCK API] Returning ${paginatedData.length} applications`);

  return {
    data: paginatedData,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit),
  };
}

/**
 * Get single application by ID
 */
export async function getApplicationById(applicationId: string) {
  console.log('[MOCK API] getApplicationById called with:', applicationId);
  await delay(500);

  const application = mockApplications.find((app) => app.id === applicationId);

  if (!application) {
    throw new Error('Application not found');
  }

  console.log('[MOCK API] Found application:', application.applicantName);
  return application;
}

/**
 * Approve tutor application
 */
export async function approveApplication(
  applicationId: string,
  adminNotes?: string
) {
  console.log('[MOCK API] approveApplication called:', {
    applicationId,
    adminNotes,
  });
  await delay(1000);

  const index = mockApplications.findIndex((app) => app.id === applicationId);

  if (index === -1) {
    throw new Error('Application not found');
  }

  // Update status to approved
  mockApplications[index] = {
    ...mockApplications[index],
    status: 'approved',
  };

  console.log(
    '[MOCK API] Application approved:',
    mockApplications[index].applicantName
  );

  return {
    success: true,
    message: 'Application approved successfully',
    data: mockApplications[index],
  };
}

/**
 * Reject tutor application
 */
export async function rejectApplication(
  applicationId: string,
  rejectionReason: string
) {
  console.log('[MOCK API] rejectApplication called:', {
    applicationId,
    rejectionReason,
  });
  await delay(1000);

  const index = mockApplications.findIndex((app) => app.id === applicationId);

  if (index === -1) {
    throw new Error('Application not found');
  }

  // Update status to rejected
  mockApplications[index] = {
    ...mockApplications[index],
    status: 'rejected',
  };

  console.log(
    '[MOCK API] Application rejected:',
    mockApplications[index].applicantName
  );

  return {
    success: true,
    message: 'Application rejected successfully',
    data: mockApplications[index],
  };
}

// ==========================================================
// Debug Helper (Browser Console)
// ==========================================================

if (typeof window !== 'undefined') {
  (window as any).__mockTutorAPI = {
    getApplications: () => mockApplications,
    clearAll: () => {
      mockApplications = [];
      console.log('[MOCK API] All applications cleared');
    },
    loadSample: () => {
      mockApplications = [
        {
          id: '1',
          applicantName: 'Test User',
          applicantEmail: 'test@example.com',
          teachingLanguages: ['English'],
          specialization: 'Test Specialization',
          experience: 2,
          bio: 'This is a test bio for the sample application.',
          certificateName: 'Test Certificate',
          certificateUrl: 'https://example.com/cert.pdf',
          status: 'pending',
          appliedDate: new Date().toISOString().split('T')[0],
        },
      ];
      console.log('[MOCK API] Sample application loaded');
    },
  };
}
