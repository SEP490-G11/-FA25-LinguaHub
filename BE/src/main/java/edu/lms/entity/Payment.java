package edu.lms.entity;

import edu.lms.enums.PaymentMethod;
import edu.lms.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

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
    PaymentType paymentType; // Course | BookingPlan

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    PaymentMethod paymentMethod; // PAYOS | VNPAY | BANK

    // Có thể null vì chỉ 1 trong 2 sẽ dùng (Course hoặc BookingPlan)
    @ManyToOne
    @JoinColumn(name = "enrollmentID")
    Enrollment enrollment;

    @ManyToOne
    @JoinColumn(name = "userBookingPlanID")
    UserBookingPlan userBookingPlan;

    @Builder.Default
    Boolean isPaid = false;

    @Builder.Default
    Boolean isRefund = false;

    @ManyToOne
    @JoinColumn(name = "receivedID")
    User received;

    @Builder.Default
    @Column(precision = 10, scale = 2)
    BigDecimal amountPaid = BigDecimal.ZERO;
}
