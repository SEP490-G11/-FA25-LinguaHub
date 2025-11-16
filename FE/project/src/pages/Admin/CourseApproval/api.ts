import axios from '@/config/axiosConfig';
import { PendingCourse, CourseDetail, PaginatedResponse, ApprovalFilters } from './types';

/**
 * Admin API for Course Approval Management
 */
export const courseApprovalApi = {
  /**
   * Get all pending courses (both live courses and drafts)
   */
  getPendingCourses: async (
    page: number = 1,
    limit: number = 10,
    filters?: ApprovalFilters
  ): Promise<PaginatedResponse<PendingCourse>> => {
    try {
      // Fetch both live pending courses and draft pending courses
      const [liveCoursesResponse, draftCoursesResponse] = await Promise.all([
        axios.get('/admin/courses/by-status', { params: { status: 'Pending' } }),
        axios.get('/admin/courses/drafts', { params: { status: 'PENDING_REVIEW' } }),
      ]);

      const liveCourses = liveCoursesResponse?.data?.result || [];
      const draftCourses = draftCoursesResponse?.data?.result || [];

      console.log('📊 Live courses response:', liveCourses);
      console.log('📊 Draft courses response:', draftCourses);

      // Combine and map to PendingCourse format
      let allCourses: PendingCourse[] = [
        ...liveCourses.map((course: any) => {
          console.log('🔍 Mapping live course:', course);
          console.log('  - categoryName:', course.categoryName);
          console.log('  - level:', course.level);
          console.log('  - language:', course.language);
          return {
            id: course.id, // AdminCourseResponse uses 'id' field
            title: course.title,
            shortDescription: course.shortDescription || '',
            description: course.description || '',
            requirement: course.requirement || '',
            level: course.level || 'BEGINNER',
            categoryID: 0, // Not provided in response
            categoryName: course.categoryName || 'Unknown',
            language: course.language || 'English',
            duration: course.duration || 0,
            price: course.price || 0,
            thumbnailURL: course.thumbnailURL || '',
            status: 'Pending',
            tutorID: 0, // Not provided in response
            tutorName: course.tutorName,
            tutorEmail: course.tutorEmail,
            createdAt: course.createdAt || new Date().toISOString(),
            updatedAt: course.updatedAt || new Date().toISOString(),
            isDraft: false,
          };
        }),
        ...draftCourses.map((draft: any) => {
          console.log('🔍 Mapping draft course:', draft);
          console.log('  - categoryName:', draft.categoryName);
          console.log('  - level:', draft.level);
          console.log('  - language:', draft.language);
          return {
            id: draft.draftID, // AdminCourseDraftResponse uses 'draftID' field
            title: draft.title,
            shortDescription: draft.shortDescription || '',
            description: draft.description || '',
            requirement: draft.requirement || '',
            level: draft.level || 'BEGINNER',
            categoryID: 0, // Not provided in response
            categoryName: draft.categoryName || 'Unknown',
            language: draft.language || 'English',
            duration: draft.duration || 0,
            price: draft.price || 0,
            thumbnailURL: draft.thumbnailURL || '',
            status: 'Pending',
            tutorID: 0, // Not provided in response
            tutorName: draft.tutorName,
            tutorEmail: draft.tutorEmail,
            createdAt: draft.createdAt || new Date().toISOString(),
            updatedAt: draft.updatedAt || new Date().toISOString(),
            isDraft: true,
          };
        }),
      ];

      console.log('✅ All mapped courses:', allCourses);

      // Apply filters
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        allCourses = allCourses.filter(
          (course) =>
            course.title.toLowerCase().includes(searchLower) ||
            course.tutorName?.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.categoryID) {
        allCourses = allCourses.filter(
          (course) => course.categoryID === filters.categoryID
        );
      }

      // Sort by createdAt (newest first)
      allCourses.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Apply pagination
      const total = allCourses.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedCourses = allCourses.slice(startIndex, startIndex + limit);

      return {
        data: paginatedCourses,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error: any) {
      console.error('❌ Error fetching pending courses:', error);
      throw new Error(
        error?.response?.data?.message || 
        error.message || 
        'Failed to fetch pending courses'
      );
    }
  },

  /**
   * Get full course details including sections, lessons, and objectives
   */
  getCourseDetail: async (courseId: number, isDraft: boolean = false): Promise<CourseDetail> => {
    try {
      const endpoint = isDraft
        ? `/admin/courses/drafts/${courseId}/detail`
        : `/admin/courses/${courseId}/detail`;
      
      console.log('🔍 Fetching course detail:', { courseId, isDraft, endpoint });
      
      const response = await axios.get(endpoint);
      const data = response?.data?.result || response?.data || {};

      console.log('📊 Course detail response:', data);

      // Map objectives from string[] to Objective[]
      const objectives = (data.objectives || []).map((text: string, index: number) => ({
        objectiveID: index + 1,
        objectiveText: text,
        orderIndex: index,
      }));

      // Map response to CourseDetail format
      return {
        id: data.id || courseId, // AdminCourseDetailResponse uses 'id' field
        title: data.title,
        shortDescription: data.shortDescription || '',
        description: data.description || '',
        requirement: data.requirement || '',
        level: data.level || 'BEGINNER',
        categoryID: 0, // Not provided in response
        categoryName: data.categoryName,
        language: data.language || 'English',
        duration: data.duration || 0,
        price: data.price || 0,
        thumbnailURL: data.thumbnailURL || '',
        status: 'Pending',
        tutorID: 0, // Not provided in response
        tutorName: data.tutorName,
        tutorEmail: data.tutorEmail,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        section: data.sections || [],
        objectives: objectives,
        adminNotes: data.adminReviewNote,
        rejectionReason: data.adminReviewNote,
        isDraft: data.draft || isDraft,
      };
    } catch (error: any) {
      console.error('❌ Error fetching course detail:', error);
      throw new Error(
        error?.response?.data?.message || 
        error.message || 
        'Failed to fetch course details'
      );
    }
  },

  /**
   * Approve a pending course (live or draft)
   */
  approveCourse: async (
    courseId: number,
    isDraft: boolean = false,
    adminNotes?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const endpoint = isDraft
        ? `/admin/courses/drafts/${courseId}/approve`
        : `/admin/courses/${courseId}/approve`;

      const payload = adminNotes ? { note: adminNotes } : {};
      await axios.post(endpoint, payload);

      return {
        success: true,
        message: 'Course approved successfully',
      };
    } catch (error: any) {
      console.error('❌ Error approving course:', error);
      throw new Error(
        error?.response?.data?.message || 
        error.message || 
        'Failed to approve course'
      );
    }
  },

  /**
   * Reject a pending course with reason (live or draft)
   */
  rejectCourse: async (
    courseId: number,
    isDraft: boolean = false,
    rejectionReason: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const endpoint = isDraft
        ? `/admin/courses/drafts/${courseId}/reject`
        : `/admin/courses/${courseId}/reject`;

      await axios.post(endpoint, { note: rejectionReason });

      return {
        success: true,
        message: 'Course rejected successfully',
      };
    } catch (error: any) {
      console.error('❌ Error rejecting course:', error);
      throw new Error(
        error?.response?.data?.message || 
        error.message || 
        'Failed to reject course'
      );
    }
  },
};

export default courseApprovalApi;
