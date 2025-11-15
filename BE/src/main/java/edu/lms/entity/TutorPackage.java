package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Tutor_Packages")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TutorPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long packageID;

    @Column(nullable = false, length = 100)
    String name;

    @Column(nullable = true, columnDefinition = "TEXT")
    String description;

    @Builder.Default
    @Column(nullable = false)
    BigDecimal price = BigDecimal.ZERO;

    @Column(nullable = false)
    Integer maxSlots; // số slot mà gói này cung cấp

    // tutor sở hữu gói này
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    Tutor tutor;

    @Builder.Default
    @Column(nullable = false)
    Boolean isActive = true;

    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();

    LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
