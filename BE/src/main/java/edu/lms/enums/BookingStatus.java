package edu.lms.enums;

public enum BookingStatus {
    Paid,        // Người học đã thanh toán
    Scheduled,   // Đã chọn slot (hệ thống tự xác nhận)
    Completed,   // Đã học xong
    Cancelled    // Hủy bởi user hoặc hệ thống
}