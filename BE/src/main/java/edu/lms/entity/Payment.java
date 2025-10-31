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

    @Column(precision = 10, scale = 2)
    BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    PaymentType paymentType; // COURSE | BOOKING

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    PaymentMethod paymentMethod; // PAYOS | VNPAY | BANK

    //NEW: Mã định danh giao dịch để PayOS hoặc VNPAY nhận dạng
    @Column(unique = true, length = 100)
    String orderCode;

    //NEW: Mã link thanh toán (PayOS trả về)
    @Column(length = 100)
    String paymentLinkId;

    //NEW: URL để FE redirect người học tới trang thanh toán
    @Column(length = 500)
    String checkoutUrl;

    //NEW: QR code link nếu muốn hiển thị trực tiếp trên FE
    @Column(length = 500)
    String qrCodeUrl;

    //NEW: Trạng thái (Pending, Paid, Failed, Refund)
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    PaymentStatus status;


    //NEW: Thời điểm giao dịch hoàn tất (PayOS gửi về qua webhook)
    LocalDateTime paidAt;

    //NEW: Dữ liệu phản hồi gốc (raw) để đối soát
    @Lob
    String transactionResponse;

    // Giữ nguyên các liên kết logic
    @ManyToOne
    @JoinColumn(name = "enrollmentID")
    Enrollment enrollment; // Khi thanh toán Course

    @ManyToOne
    @JoinColumn(name = "userBookingPlanID")
    UserBookingPlan userBookingPlan; // Khi thanh toán Booking

    @Builder.Default
    Boolean isPaid = false;

    @Builder.Default
    Boolean isRefund = false;

    @ManyToOne
    @JoinColumn(name = "receivedID")
    User received; // Người nhận tiền (Tutor hoặc Admin)

    @Builder.Default
    @Column(precision = 10, scale = 2)
    BigDecimal amountPaid = BigDecimal.ZERO;
}
