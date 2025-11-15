package edu.lms.entity;

import edu.lms.enums.TutorVerificationStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @Builder.Default
    @Column(nullable = false)
    Short experience = 0;

    @Column(length = 255)
    String specialization;

    @Column(length = 100)
    String teachingLanguage;

    @Column(columnDefinition = "TEXT")
    String bio;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    TutorVerificationStatus status = TutorVerificationStatus.PENDING;

    @Builder.Default
    LocalDateTime submittedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ReviewedBy", referencedColumnName = "userID")
    User reviewedBy;

    LocalDateTime reviewedAt;

    @Column(columnDefinition = "TEXT")
    String reasonForReject;

    @Builder.Default
    @OneToMany(mappedBy = "tutorVerification", cascade = CascadeType.ALL, orphanRemoval = true)
    List<TutorCertificate> certificates = new ArrayList<>();
}
