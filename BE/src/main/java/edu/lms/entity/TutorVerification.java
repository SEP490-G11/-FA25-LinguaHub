package edu.lms.entity;

import edu.lms.enums.TutorVerificationStatus;
import edu.lms.enums.VerificationStatus;
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

    @Column(length = 255)
    String documentURL;

    @Enumerated(EnumType.STRING)
    @Column(length = 10, nullable = false)
    TutorVerificationStatus status = TutorVerificationStatus.Pending;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ReviewedBy", referencedColumnName = "userID")
    User reviewedBy;

    LocalDateTime reviewedAt;
}
