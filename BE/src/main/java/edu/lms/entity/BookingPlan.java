package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

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

    @Column(nullable = false, length = 50)
    String title; // e.g., T2, T3, T4, T5, T6, T7, CN

    @Column(nullable = false)
    Integer startHours; // e.g., 8

    @Column(nullable = false)
    Integer endHours; // e.g., 22

    @Column(nullable = false)
    Boolean isActive = true;

    @Column(nullable = false)
    Boolean isOpen = true;

    @Column(name = "tutor_id", nullable = false)
    Long tutorID;

    @Column(nullable = false)
    Integer slotDuration;

    @Column(nullable = false)
    Double pricePerHours = 0.0;

    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    LocalDateTime updatedAt = LocalDateTime.now();
}
