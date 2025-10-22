package edu.lms.entity;

import edu.lms.enums.TutorStatus;
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
@Table(name = "Tutor")
public class Tutor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long tutorID;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID", nullable = false, unique = true)
    User user;

    @Column(nullable = false)
    Short experience = 0; // Default 0

    @Column(length = 255)
    String specialization;

    @Column(length = 100)
    String teachingLanguage;

    @Column(columnDefinition = "TEXT")
    String bio;

    @Column(precision = 3, scale = 2)
    BigDecimal rating = BigDecimal.ZERO; // Default 0.0

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    TutorStatus status = TutorStatus.PENDING; // Default Pending
}