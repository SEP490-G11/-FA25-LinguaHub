package edu.lms.entity;

import edu.lms.enums.TutorStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

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

    @Column
    Short experience; //

    @Column(length = 255)
    String specialization;

    @Column(precision = 3, scale = 2)
    Double rating;

    @Enumerated(EnumType.STRING)
    TutorStatus status; // ENUM('Pending','Approved','Suspended')
}