package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "BookingPlan")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long bookingPlanID;

    @Column(nullable = false, length = 100)
    String title;

    @Column(name = "start_hours", nullable = false)
    LocalTime startTime;

    @Column(name = "end_hours", nullable = false)
    LocalTime endTime;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    Boolean isActive = true;

    @Builder.Default
    @Column(name = "is_open", nullable = false)
    Boolean isOpen = true;

    @Column(name = "tutor_id", nullable = false)
    Long tutorID;

    @Column(name = "slot_duration", nullable = false)
    Integer slotDuration; // minutes

    @Builder.Default
    @Column(name = "price_per_hours", nullable = false)
    Double pricePerHours = 0.0;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
