import axios from '@/config/axiosConfig';
import { Payment, PaymentFilters, PaginatedResponse } from './types';

/**
 * Admin API for Payment Management
 */
export const paymentApi = {
  /**
   * Get all payments with pagination and filters
   * @param page - Current page number (1-indexed)
   * @param limit - Number of items per page
   * @param filters - Optional filter criteria (search, type, status, method)
   * @returns Paginated payment response
   */
  getPayments: async (
    page: number = 1,
    limit: number = 10,
    filters?: PaymentFilters
  ): Promise<PaginatedResponse<Payment>> => {
    try {
      // Build query parameters
      const params: Record<string, any> = {
        page,
        limit,
      };

      // Add filter parameters if provided
      if (filters?.search) {
        params.search = filters.search;
      }
      if (filters?.type) {
        params.type = filters.type;
      }
      if (filters?.status) {
        params.status = filters.status;
      }
      if (filters?.method) {
        params.method = filters.method;
      }

      console.log('🔍 Fetching payments with params:', params);

      // Make API request
      const response = await axios.get('/api/payments/admin', { params });
      
      console.log('📊 Full API response:', response);
      console.log('📊 Response data:', response?.data);
      
      // Extract data from response - handle multiple possible structures
      const result = response?.data?.result || response?.data || {};
      
      console.log('📊 Extracted result:', result);
      
      // Try to find the payments array in different possible locations
      let paymentsArray: any[] = [];
      
      if (Array.isArray(result.data)) {
        paymentsArray = result.data;
      } else if (Array.isArray(result.content)) {
        paymentsArray = result.content;
      } else if (Array.isArray(result.payments)) {
        paymentsArray = result.payments;
      } else if (Array.isArray(result)) {
        paymentsArray = result;
      }
      
      console.log('📊 Payments array:', paymentsArray);

      // Transform API response to match frontend types
      const payments: Payment[] = paymentsArray.map((payment: any) => ({
        paymentID: payment.paymentID,
        userId: payment.userId,
        tutorId: payment.tutorId,
        targetId: payment.targetId,
        paymentType: payment.paymentType,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        amount: payment.amount,
        isPaid: payment.isPaid,
        isRefund: payment.isRefund,
        orderCode: payment.orderCode,
        paymentLinkId: payment.paymentLinkId,
        checkoutUrl: payment.checkoutUrl || '',
        qrCodeUrl: payment.qrCodeUrl || '',
        createdAt: payment.createdAt,
        paidAt: payment.paidAt || '',
        description: payment.description || '',
        expiresAt: payment.expiresAt || '',
      }));

      // Return paginated response
      return {
        data: payments,
        total: result.total || payments.length,
        page: result.page || page,
        limit: result.limit || limit,
        totalPages: result.totalPages || Math.ceil((result.total || payments.length) / limit),
      };
    } catch (error: any) {
      console.error('❌ Error fetching payments:', error);
      
      // Handle different error scenarios with Vietnamese messages
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        switch (status) {
          case 401:
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          case 403:
            throw new Error('Bạn không có quyền truy cập trang này.');
          case 404:
            throw new Error('Không tìm thấy dữ liệu thanh toán.');
          case 500:
            throw new Error('Lỗi server. Vui lòng thử lại sau.');
          default:
            throw new Error(message || 'Không thể tải danh sách giao dịch. Vui lòng thử lại.');
        }
      } else if (error.request) {
        // Network error
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        // Other errors
        throw new Error(error.message || 'Đã xảy ra lỗi không xác định.');
      }
    }
  },
};

export default paymentApi;
