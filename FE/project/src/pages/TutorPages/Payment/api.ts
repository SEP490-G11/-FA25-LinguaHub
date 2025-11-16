import axios from '@/config/axiosConfig';
import { Payment } from './types';

/**
 * Tutor API for Payment Management
 */
export const tutorPaymentApi = {
  /**
   * Get all payments for the authenticated tutor
   * @returns Array of payment records
   */
  getTutorPayments: async (): Promise<Payment[]> => {
    try {
      console.log('🔍 Fetching tutor payments');

      // Make API request
      const response = await axios.get('/api/payments/me');
      
      console.log('📊 Full API response:', response);
      console.log('📊 Response data:', response?.data);
      
      // Extract data from response - handle multiple possible structures
      let paymentsArray: any[] = [];
      
      if (Array.isArray(response?.data?.result)) {
        paymentsArray = response.data.result;
      } else if (Array.isArray(response?.data)) {
        paymentsArray = response.data;
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

      return payments;
    } catch (error: any) {
      console.error('❌ Error fetching tutor payments:', error);
      
      // Handle different error scenarios with Vietnamese messages
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        switch (status) {
          case 401:
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          case 403:
            throw new Error('Bạn không có quyền truy cập dữ liệu này.');
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

export default tutorPaymentApi;
