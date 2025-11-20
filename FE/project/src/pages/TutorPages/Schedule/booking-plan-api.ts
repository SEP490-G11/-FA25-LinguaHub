import axios from '@/config/axiosConfig';
import { AxiosError } from 'axios';
import { BookingPlanRequest, BookingPlanResponse, BookingPlansResponse, UpdateBookingPlanResponse, DeleteBookingPlanResponse } from '@/pages/TutorPages/Schedule/type';

const BASE_URL = '/tutors/booking-plans';

// Enhanced error handling utility with better typing
const handleApiError = (error: unknown, operation: string): never => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error ${operation}:`, error);
  }
  
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError;
    
    // Network error
    if (!axiosError.response) {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    }
    
    // Server error responses
    const status = axiosError.response.status;
    const responseData = axiosError.response.data as any;
    
    switch (status) {
      case 400:
        throw new Error(responseData?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.');
      case 401:
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      case 403:
        throw new Error('Bạn không có quyền thực hiện thao tác này.');
      case 404:
        throw new Error('Không tìm thấy dữ liệu yêu cầu.');
      case 409:
        throw new Error(responseData?.message || 'Dữ liệu đã tồn tại hoặc xung đột.');
      case 422:
        throw new Error(responseData?.message || 'Dữ liệu không đúng định dạng yêu cầu.');
      case 500:
        throw new Error('Lỗi máy chủ nội bộ. Vui lòng thử lại sau.');
      case 503:
        throw new Error('Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.');
      default:
        throw new Error(responseData?.message || `Có lỗi xảy ra (${status}). Vui lòng thử lại.`);
    }
  }
  
  // Generic error
  throw new Error('Có lỗi không xác định xảy ra. Vui lòng thử lại.');
};

export const bookingPlanApi = {
  // Create a new booking plan
  createBookingPlan: async (data: BookingPlanRequest): Promise<BookingPlanResponse> => {
    try {
      const response = await axios.post<BookingPlanResponse>(BASE_URL, data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'creating booking plan');
    }
  },

  // Get all booking plans for a tutor
  getBookingPlans: async (tutorId: number): Promise<BookingPlansResponse> => {
    try {
      const response = await axios.get<BookingPlansResponse>(`/tutor/${tutorId}/booking-plan`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'fetching booking plans');
    }
  },

  // Update a booking plan
  updateBookingPlan: async (bookingPlanId: number, data: BookingPlanRequest): Promise<UpdateBookingPlanResponse> => {
    try {
      const response = await axios.put<UpdateBookingPlanResponse>(`/tutor/booking-plan/${bookingPlanId}`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'updating booking plan');
    }
  },

  // Delete a booking plan
  deleteBookingPlan: async (bookingPlanId: number): Promise<DeleteBookingPlanResponse> => {
    try {
      const response = await axios.delete<DeleteBookingPlanResponse>(`/tutor/booking-plan/${bookingPlanId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'deleting booking plan');
    }
  },
};
