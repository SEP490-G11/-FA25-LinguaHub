package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "Tutor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tutor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TutorID")
    private Long tutorId;

    @OneToOne
    @JoinColumn(name = "UserID", referencedColumnName = "UserID", nullable = false, unique = true)
    private User user;

    @Column(name = "Experience")
    private Short experience;

    @Column(name = "Specialization")
    private String specialization;

    @Column(name = "Rating", precision = 3, scale = 2)
    private BigDecimal rating;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status")
    private TutorStatus status;

    // Enum for Tutor Status
    public enum TutorStatus {
        Pending, Approved, Suspended
    }
}
