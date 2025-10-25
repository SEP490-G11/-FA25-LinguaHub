package edu.lms.entity;

import edu.lms.enums.TutorVerificationStatus;
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
@Table(name = "TutorVerification")
public class TutorVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long tutorVerificationID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TutorID", nullable = false)
    Tutor tutor;

    @Column(nullable = false)
    Short experience = 0;

    @Column(length = 255)
    String specialization;

    @Column(length = 100)
    String teachingLanguage;

    @Column(columnDefinition = "TEXT")
    String bio;

    @Column(length = 255)
    String certificateName;

    @Column(length = 255, nullable = false)
    String documentURL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    TutorVerificationStatus status = TutorVerificationStatus.PENDING;

    LocalDateTime submittedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ReviewedBy", referencedColumnName = "userID")
    User reviewedBy;

    LocalDateTime reviewedAt;

    @Column(columnDefinition = "TEXT")
    String reasonForReject;
}
