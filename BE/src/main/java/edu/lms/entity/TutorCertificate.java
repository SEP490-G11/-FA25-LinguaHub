package edu.lms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "Tutor_Certificate")
public class TutorCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long certificateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_verification_id", nullable = false)
    TutorVerification tutorVerification;

    @Column(nullable = false, length = 255)
    String certificateName;

    @Column(nullable = false, length = 255)
    String documentURL;

    @Builder.Default
    @Column(nullable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}


