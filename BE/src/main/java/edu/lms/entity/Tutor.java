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
    Long tutorID;

    @OneToOne
    @JoinColumn(name = "userID", unique = true, nullable = false)
    User user;

    Short experience = 0;
    String specialization;
    String teachingLanguage;
    String bio;

    @Builder.Default
    BigDecimal rating = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    TutorStatus status = TutorStatus.PENDING;

    @OneToMany(mappedBy = "tutor", cascade = CascadeType.ALL)
    List<TutorVerification> verifications;

    @OneToMany
    @JoinColumn(name = "tutor_id", referencedColumnName = "tutorID")
    List<BookingPlan> bookingPlans;

}
