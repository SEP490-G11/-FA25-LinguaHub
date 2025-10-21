package edu.lms.entity;

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

    @ManyToOne
    @JoinColumn(name = "tutorID", nullable = false)
    Tutor tutor;

    String documentURL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus status;


    @ManyToOne
    @JoinColumn(name = "reviewedBy")
    User reviewedBy;

    LocalDateTime reviewedAt;
}
