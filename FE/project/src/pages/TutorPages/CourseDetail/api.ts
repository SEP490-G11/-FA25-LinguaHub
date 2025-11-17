import axiosInstance from '@/config/axiosConfig';
import type { CourseDetail as Course } from '@/pages/Admin/CourseApproval/types';

/**
 * Get course detail for tutor
 * GET /tutor/courses/{courseId}/detail
 */
export const getCourseDetail = async (courseId: string): Promise<Course> => {
  try {
    const response = await axiosInstance.get(`/tutor/courses/${courseId}`);
    
    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'Failed to fetch course detail');
    }

    const data = response.data.result || response.data || {};
    
    // Map objectives from string[] to Objective[]
    const objectives = (data.objectives || []).map((text: string, index: number) => ({
      objectiveID: index + 1,
      objectiveText: text,
      orderIndex: index,
    }));

    // Map admin notes from various possible field names
    const adminNotes = data.adminReviewNote || data.adminNotes || data.rejectionReason || data.reviewNote;
    
    console.log('📚 Course detail API response:', {
      courseId,
      status: data.status,
      hasAdminNotes: !!adminNotes,
      adminNotesFields: {
        adminReviewNote: data.adminReviewNote,
        adminNotes: data.adminNotes,
        rejectionReason: data.rejectionReason,
        reviewNote: data.reviewNote,
      }
    });

    return {
      ...data,
      objectives,
      courseID: data.id || courseId,
      adminNotes, // Map various backend field names
      section: data.sections || data.section || [], // Map sections field
    };
  } catch (error: any) {
    console.error('❌ Error fetching course detail:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to fetch course detail'
    );
  }
};

/**
 * Delete a course
 * DELETE /tutor/courses/{courseId}
 */
export const deleteCourse = async (courseId: number): Promise<void> => {
  try {
    const response = await axiosInstance.delete(`/tutor/courses/${courseId}`);

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'Failed to delete course');
    }
  } catch (error: any) {
    console.error('❌ Error deleting course:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to delete course'
    );
  }
};