package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "Schedule")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long scheduleID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutorID", nullable = false)
    Tutor tutor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookingPlanID", nullable = false)
    BookingPlan bookingPlan;

    @Column(nullable = false)
    LocalDate slotDate;

    @Column(nullable = false)
    LocalTime startTime;

    @Column(nullable = false)
    LocalTime endTime;

    @Builder.Default
    Boolean isAvailable = true;
}
