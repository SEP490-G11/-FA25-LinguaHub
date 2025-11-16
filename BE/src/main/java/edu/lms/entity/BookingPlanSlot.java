package edu.lms.entity;

import edu.lms.enums.SlotStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "booking_plan_slot")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingPlanSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "slotid")
    Long slotID;

    @Column(name = "booking_plan_id")
    Long bookingPlanID;

    @Column(name = "tutor_id", nullable = false)
    Long tutorID;

    @Column(name = "user_id")
    Long userID;

    @Column(name = "start_time", nullable = false)
    LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    LocalDateTime endTime;

    @Column(name = "payment_id")
    Long paymentID;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "ENUM('Available','Locked','Paid')")
    SlotStatus status = SlotStatus.Available;

    @Column(name = "locked_at")
    LocalDateTime lockedAt;

    @Column(name = "expires_at")
    LocalDateTime expiresAt; // slot hết hạn nếu chưa thanh toán

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_package_id")
    UserPackage userPackage;
}
