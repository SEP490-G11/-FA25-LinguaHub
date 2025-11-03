package edu.lms.enums;

public enum PaymentStatus {
    PENDING,   // Đã tạo link, chưa thanh toán
    PAID,      // Thanh toán thành công
    FAILED,    // Giao dịch thất bại
    CANCELLED, // Người dùng hủy thanh toán
    REFUND     // Hoàn tiền
}
