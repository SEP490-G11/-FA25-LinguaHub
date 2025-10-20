package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TutorVerification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TutorVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TutorVerificationID")
    private Long tutorVerificationId;

    @ManyToOne
    @JoinColumn(name = "TutorID", referencedColumnName = "TutorID", nullable = false)
    private Tutor tutor;

    @Column(name = "DocumentURL")
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status")
    private Status status;

    @ManyToOne
    @JoinColumn(name = "ReviewedBy", referencedColumnName = "UserID")
    private User reviewedBy;

    @Column(name = "ReviewedAt")
    private LocalDateTime reviewedAt;

    // ENUM status
    public enum Status {
        Pending, Approved, Rejected
    }
}
