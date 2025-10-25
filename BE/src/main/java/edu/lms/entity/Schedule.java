package edu.lms.entity;

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
@Table(name = "Schedule")
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long scheduleID;

    @ManyToOne
    @JoinColumn(name = "tutorID", nullable = false)
    Tutor tutor;

    LocalDateTime startTime;
    LocalDateTime endTime;
    Boolean isAvailable = true;
}
