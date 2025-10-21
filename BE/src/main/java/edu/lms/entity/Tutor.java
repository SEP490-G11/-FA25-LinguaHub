package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;

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
    @JoinColumn(name = "UserID", nullable = false, unique = true)
    private User user; // Liên kết tới bảng Users

    @Column(name = "Experience")
    private Short experience;

    @Column(name = "Specialization", length = 255)
    private String specialization;

    @Column(name = "Rating", precision = 3, scale = 2)
    private Double rating;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", length = 10)
    private TutorStatus status;

    public enum TutorStatus {
        Pending,
        Approved,
        Suspended
    }
}
