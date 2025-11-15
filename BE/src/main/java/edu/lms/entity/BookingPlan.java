package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
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

    @Column(nullable = false)
    LocalDate date;

    @Column(nullable = false)
    LocalTime startTime;

    @Column(nullable = false)
    LocalTime endTime;

    @Builder.Default
    @Column(nullable = false)
    Boolean isActive = true;

    @Builder.Default
    @Column(nullable = false)
    Boolean isOpen = true;

    @Column(name = "tutor_id", nullable = false)
    Long tutorID;

    @Column(nullable = false)
    Integer slotDuration; // minutes

    @Builder.Default
    @Column(nullable = false)
    Double pricePerHours = 0.0;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
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
