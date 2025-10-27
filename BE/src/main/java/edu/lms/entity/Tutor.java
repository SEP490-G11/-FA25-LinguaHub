package edu.lms.entity;

import edu.lms.enums.TutorStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.util.List;

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
    @Column(name = "TutorID")
    Long tutorID;

    @OneToOne
    @JoinColumn(name = "UserID", unique = true, nullable = false)
    User user;

    @Column(name = "Experience", columnDefinition = "SMALLINT DEFAULT 0")
    Short experience = 0;

    @Column(name = "Specialization", length = 255)
    String specialization;

    @Column(name = "TeachingLanguage", length = 100)
    String teachingLanguage;

    @Column(name = "Bio", columnDefinition = "TEXT")
    String bio;

    @Column(name = "Rating", precision = 3, scale = 2, columnDefinition = "DECIMAL(3,2) DEFAULT 0.0")
    BigDecimal rating = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", columnDefinition = "ENUM('Pending','Approved','Suspended') DEFAULT 'Pending'")
    TutorStatus status = TutorStatus.PENDING;

    @OneToMany(mappedBy = "tutor", cascade = CascadeType.ALL)
    List<TutorVerification> verifications;

    @OneToMany(mappedBy = "tutor", cascade = CascadeType.ALL)
    List<Service> services;
}
