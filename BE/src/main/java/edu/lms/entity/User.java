package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserID")
    private Long userId;

    @Column(name = "Email", nullable = false, unique = true)
    private String email;

    @Column(name = "PasswordHash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "Role", nullable = false)
    private Role role;

    @Column(name = "FullName")
    private String fullName;

    @Column(name = "AvatarURL")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "Gender")
    private Gender gender;

    @Column(name = "DOB")
    private LocalDate dob;

    @Column(name = "Phone")
    private String phone;

    @Column(name = "Country")
    private String country;

    @Column(name = "Address")
    private String address;

    @Column(name = "Bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "IsActive")
    private Boolean isActive;

    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    // Automatically set CreatedAt and UpdatedAt
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ENUMS
    public enum Role {
        Admin, Tutor, Learner
    }

    public enum Gender {
        Male, Female, Other
    }
}
