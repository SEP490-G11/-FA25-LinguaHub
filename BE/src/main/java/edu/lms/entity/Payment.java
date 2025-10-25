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

    BigDecimal amount;
    @Enumerated(EnumType.STRING)
    PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    PaymentMethod paymentMethod;

    @ManyToOne @JoinColumn(name = "enrollmentID")
    Enrollment enrollment;

    @ManyToOne @JoinColumn(name = "userServiceID")
    UserService userService;

    Boolean isPaid = false;
    Boolean isRefund = false;

    @ManyToOne @JoinColumn(name = "receivedID")
    User received;

    BigDecimal amountPaid = BigDecimal.ZERO;
}
