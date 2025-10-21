package edu.lms.entity;

import edu.lms.enums.Gender;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "Users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long userID;

    @NotBlank(message = "Email is required")
    @Column(nullable = false, unique = true, length = 255)
    String email;

    @Column(unique = true, length = 100)
    String username;

    @Column(nullable = false, length = 255)
    String passwordHash;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_name", referencedColumnName = "name")
    Role role;

    String fullName;
    String avatarURL;

    @Enumerated(EnumType.STRING)
    Gender gender;

    LocalDate dob;
    String phone;
    String country;
    String address;

    @Column(columnDefinition = "TEXT")
    String bio;

    @Column(nullable = false)
    Boolean isActive = true;

    @Column(nullable = false)
    LocalDateTime createdAt;

    @Column(nullable = false)
    LocalDateTime updatedAt;

    // ✅ Auto set createdAt & updatedAt khi insert/update
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
