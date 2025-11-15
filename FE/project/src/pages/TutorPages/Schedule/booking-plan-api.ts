import axios from '@/config/axiosConfig';
import { BookingPlanRequest, BookingPlanResponse } from '@/pages/TutorPages/Schedule/type';

const BASE_URL = '/tutors/booking-plans';

export const bookingPlanApi = {
  // Create a new booking plan
  createBookingPlan: async (data: BookingPlanRequest): Promise<BookingPlanResponse> => {
    const response = await axios.post<BookingPlanResponse>(BASE_URL, data);
    return response.data;
  },

//   // Get all booking plans for a tutor
//   getBookingPlans: async (tutorId: number): Promise<BookingPlanResponse[]> => {
//     const response = await axios.get<BookingPlanResponse[]>(`${BASE_URL}?tutorId=${tutorId}`);
//     return response.data;
//   },

//   // Get a specific booking plan by ID
//   getBookingPlanById: async (id: number): Promise<BookingPlanResponse> => {
//     const response = await axios.get<BookingPlanResponse>(`${BASE_URL}/${id}`);
//     return response.data;
//   },

//   // Update a booking plan
//   updateBookingPlan: async (id: number, data: BookingPlanRequest): Promise<BookingPlanResponse> => {
//     const response = await axios.put<BookingPlanResponse>(`${BASE_URL}/${id}`, data);
//     return response.data;
//   },

//   // Delete a booking plan
//   deleteBookingPlan: async (id: number): Promise<void> => {
//     await axios.delete(`${BASE_URL}/${id}`);
//   },
};
