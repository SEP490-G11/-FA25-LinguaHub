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
@Table(name = "Booking_Plan_Slot")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingPlanSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "slot_id")
    Long slotID;

    @Column(name = "booking_plan_id", nullable = false)
    Long bookingPlanID;

    @Column(name = "tutor_id", nullable = false)
    Long tutorID; // tutor có thể xem danh sách learner book slot của mình

    @Column(name = "user_id", nullable = true)
    Long userID; // learner nào đã book slot

    @Column(name = "start_time", nullable = false)
    LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    LocalDateTime endTime;

    @Column(name = "payment_id", nullable = true)
    Long paymentID; // liên kết với bảng Payment

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    SlotStatus status = SlotStatus.Available;

    @Column(name = "locked_at", nullable = true)
    LocalDateTime lockedAt;

    @Column(name = "expires_at", nullable = true)
    LocalDateTime expiresAt; // slot hết hạn nếu chưa thanh toán

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_package_id")
    UserPackage userPackage;


}
