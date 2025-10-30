package edu.lms.entity;

import edu.lms.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "Booking")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long bookingID;

    @ManyToOne @JoinColumn(name = "userID")
    User user;

    @ManyToOne @JoinColumn(name = "tutorID")
    Tutor tutor;

    @ManyToOne @JoinColumn(name = "scheduleID")
    Schedule schedule;

    @ManyToOne @JoinColumn(name = "userBookingPlanID")
    UserBookingPlan userBookingPlan;

    @Enumerated(EnumType.STRING)
    BookingStatus status = BookingStatus.Pending;

    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
