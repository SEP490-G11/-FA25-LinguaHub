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

    @Column(unique = true, length = 100)
    String orderCode;

    @Column(length = 100)
    String paymentLinkId;

    @Column(length = 500)
    String checkoutUrl;

    @Column(length = 500)
    String qrCodeUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    PaymentStatus status;

    LocalDateTime paidAt;

    @Lob
    String transactionResponse;

    @Column(name = "targetId")
    Long targetId;

    @Column(name = "userId")
    Long userId;

    @ManyToOne
    @JoinColumn(name = "enrollmentID")
    Enrollment enrollment;

    @Builder.Default
    Boolean isPaid = false;

    @Builder.Default
    Boolean isRefund = false;

    @ManyToOne
    @JoinColumn(name = "receivedID")
    User received;
}
