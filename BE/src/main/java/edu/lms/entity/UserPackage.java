package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "User_Package")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long userPackageID;

    // gói mà learner đã mua
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    TutorPackage tutorPackage;

    // learner nào mua gói
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(nullable = false)
    Integer slotsRemaining; // số slot còn lại

    @Column(nullable = true)
    Long paymentID; // liên kết Payment sau khi thanh toán

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
