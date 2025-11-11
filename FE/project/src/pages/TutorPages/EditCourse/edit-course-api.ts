import axiosInstance from '@/config/axiosConfig';
import {
  CourseDetail,
  ApiResponse,
  UpdateCourseRequest,
  UpdateSectionRequest,
  UpdateLessonRequest,
  UpdateResourceRequest,
  Section,
  Lesson,
  Resource,
} from './types';

/**
 * API 1: Get course details with all sections, lessons, and resources
 * GET /tutor/courses/{courseId}
 */
export const getCourseDetail = async (courseId: number): Promise<CourseDetail> => {
  try {
    const response = await axiosInstance.get<ApiResponse<CourseDetail>>(
      `/tutor/courses/${courseId}`
    );

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'Failed to fetch course details');
    }

    return response.data.result;
  } catch (error: any) {
    console.error('Error fetching course details:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch course details'
    );
  }
};

/**
 * API 2: Update course basic information
 * PUT /tutor/courses/{courseId}
 */
export const updateCourse = async (
  courseId: number,
  data: UpdateCourseRequest
): Promise<CourseDetail> => {
  try {
    const response = await axiosInstance.put<ApiResponse<CourseDetail>>(
      `/tutor/courses/${courseId}`,
      data
    );

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'Failed to update course');
    }

    return response.data.result;
  } catch (error: any) {
    console.error('Error updating course:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to update course'
    );
  }
};

/**
 * API 3: Update section
 * PUT /tutor/courses/sections/{sectionID}
 */
export const updateSection = async (
  sectionID: number,
  data: UpdateSectionRequest
): Promise<Section> => {
  try {
    const response = await axiosInstance.put<ApiResponse<Section>>(
      `/tutor/courses/sections/${sectionID}`,
      data
    );

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'Failed to update section');
    }

    return response.data.result;
  } catch (error: any) {
    console.error('Error updating section:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to update section'
    );
  }
};

/**
 * API 4: Update lesson
 * PUT /tutor/courses/sections/lessons/{lessonId}
 */
export const updateLesson = async (
  lessonId: number,
  data: UpdateLessonRequest
): Promise<Lesson> => {
  try {
    const response = await axiosInstance.put<ApiResponse<Lesson>>(
      `/tutor/courses/sections/lessons/${lessonId}`,
      data
    );

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'Failed to update lesson');
    }

    return response.data.result;
  } catch (error: any) {
    console.error('Error updating lesson:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to update lesson'
    );
  }
};

/**
 * API 5: Update resource
 * PUT /tutor/resources/{resourceId}
 */
export const updateResource = async (
  resourceId: number,
  data: UpdateResourceRequest
): Promise<Resource> => {
  try {
    const response = await axiosInstance.put<ApiResponse<Resource>>(
      `/tutor/resources/${resourceId}`,
      data
    );

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'Failed to update resource');
    }

    return response.data.result;
  } catch (error: any) {
    console.error('Error updating resource:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to update resource'
    );
  }
};

/**
 * API 6: Delete section
 * DELETE /tutor/courses/sections/{sectionID}
 */
export const deleteSection = async (sectionID: number): Promise<void> => {
  try {
    const response = await axiosInstance.delete<ApiResponse<{}>>(
      `/tutor/courses/sections/${sectionID}`
    );

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'Failed to delete section');
    }
  } catch (error: any) {
    console.error('Error deleting section:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to delete section'
    );
  }
};

/**
 * API 7: Delete lesson
 * DELETE /tutor/courses/sections/lessons/{lessonId}
 */
export const deleteLesson = async (lessonId: number): Promise<void> => {
  try {
    const response = await axiosInstance.delete<ApiResponse<{}>>(
      `/tutor/courses/sections/lessons/${lessonId}`
    );

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'Failed to delete lesson');
    }
  } catch (error: any) {
    console.error('Error deleting lesson:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to delete lesson'
    );
  }
};

/**
 * API 8: Delete resource
 * DELETE /tutor/resources/{resourceId}
 */
export const deleteResource = async (resourceId: number): Promise<void> => {
  try {
    const response = await axiosInstance.delete<ApiResponse<{}>>(
      `/tutor/resources/${resourceId}`
    );

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'Failed to delete resource');
    }
  } catch (error: any) {
    console.error('Error deleting resource:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to delete resource'
    );
  }
};

/**
 * API 9: Submit course for approval
 * PUT /tutor/courses/{courseID}/submit
 */
export const submitCourseForApproval = async (courseId: number): Promise<CourseDetail> => {
  try {
    const response = await axiosInstance.put<ApiResponse<CourseDetail>>(
      `/tutor/courses/${courseId}/submit`
    );

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'Failed to submit course');
    }

    return response.data.result;
  } catch (error: any) {
    console.error('=== ERROR SUBMITTING COURSE ===', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message,
      data: error.response?.data,
      error: error.message,
    });
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to submit course'
    );
  }
};

/**
 * API 10: Create section
 * POST /tutor/courses/sections/{courseId}
 */
export const createSection = async (
  courseId: number,
  data: UpdateSectionRequest
): Promise<Section> => {
  try {
    const payload = {
      title: data.title,
      description: data.description,
      orderIndex: data.orderIndex,
    };

    const response = await axiosInstance.post<ApiResponse<Section>>(
      `/tutor/courses/sections/${courseId}`,
      payload
    );

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'Failed to create section');
    }

    return response.data.result;
  } catch (error: any) {
    console.error('Error creating section:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to create section'
    );
  }
};

/**
 * API 11: Create lesson
 * POST /tutor/courses/sections/{sectionId}/lessons
 */
export const createLesson = async (
  sectionId: number,
  data: UpdateLessonRequest
): Promise<Lesson> => {
  try {
    const payload: Record<string, unknown> = {
      title: data.title,
      duration: data.duration,
      lessonType: data.lessonType,
      orderIndex: data.orderIndex,
    };

    // Only include optional fields if they have values
    if (data.videoURL) {
      payload.videoURL = data.videoURL;
    }
    if (data.content) {
      payload.content = data.content;
    }

    console.log('=== CREATE LESSON PAYLOAD ===', { sectionId, payload });

    const response = await axiosInstance.post<ApiResponse<Lesson>>(
      `/tutor/courses/sections/${sectionId}/lessons`,
      payload
    );

    console.log('=== CREATE LESSON RESPONSE ===', response.data);

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'Failed to create lesson');
    }

    return response.data.result;
  } catch (error: any) {
    console.error('Error creating lesson:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to create lesson'
    );
  }
};

/**
 * API 12: Create resource
 * POST /tutor/lessons/{lessonId}/resources
 */
export const createResource = async (
  lessonId: number,
  data: UpdateResourceRequest
): Promise<Resource> => {
  try {
    const payload = {
      resourceType: data.resourceType,
      resourceTitle: data.resourceTitle,
      resourceURL: data.resourceURL,
    };

    const response = await axiosInstance.post<ApiResponse<Resource>>(
      `/tutor/lessons/${lessonId}/resources`,
      payload
    );

    if (response.data.code !== 0) {
      throw new Error(response.data.message || 'Failed to create resource');
    }

    return response.data.result;
  } catch (error: any) {
    console.error('Error creating resource:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to create resource'
    );
  }
};
