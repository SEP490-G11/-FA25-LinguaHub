package edu.lms.entity;

import edu.lms.enums.PaymentMethod;
import edu.lms.enums.PaymentStatus;
import edu.lms.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "Payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long paymentID;

    //Số tiền thanh toán
    @Column(precision = 12, scale = 2, nullable = false)
    BigDecimal amount;

    //Loại thanh toán: COURSE / BOOKING
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    PaymentType paymentType;

    //Phương thức thanh toán: PAYOS / VNPAY / BANK
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    PaymentMethod paymentMethod;

    //Mã đơn hàng (unique từ PayOS)
    @Column(unique = true, length = 150)
    String orderCode;

    //ID của payment link PayOS
    @Column(length = 150)
    String paymentLinkId;

    //URL checkout của PayOS/VNPAY
    @Column(length = 500)
    String checkoutUrl;

    //QR code link
    @Column(length = 500)
    String qrCodeUrl;

    //Trạng thái thanh toán: PENDING / PAID / EXPIRED / CANCELLED
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    PaymentStatus status;

    //Thời gian thanh toán thành công
    LocalDateTime paidAt;

    //Phản hồi trả về từ cổng thanh toán
    @Lob
    String transactionResponse;

    //Khóa ngoại liên kết mục tiêu (CourseID hoặc BookingPlanID)
    @Column(name = "target_id")
    Long targetId;

    //Người mua (Learner)
    @Column(name = "user_id")
    Long userId;

    //Tutor nhận tiền (Course owner / Booking owner)
    @Column(name = "tutor_id")
    Long tutorId;

    //Liên kết enrollment (nếu thanh toán cho khóa học)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id")
    Enrollment enrollment;

    // 👤 Người nhận tiền (dự phòng cho tính năng payout hoặc refund)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "received_id")
    User received;

    //Đánh dấu đã thanh toán chưa
    @Builder.Default
    Boolean isPaid = false;

    // Đánh dấu có hoàn tiền không
    @Builder.Default
    Boolean isRefund = false;

    // 🕒 Tự động sinh thời gian tạo bản ghi (Spring sẽ set qua @PrePersist)
    @Column(updatable = false)
    LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
