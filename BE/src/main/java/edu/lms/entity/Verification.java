package edu.lms.entity;

import edu.lms.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Verification")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Verification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String email;
    String username;
    String fullName;
    String passwordHash;
    String roleName;

    @Enumerated(EnumType.STRING)
    Gender gender;
    LocalDate dob;
    String phone;
    String country;
    String address;
    @Column(columnDefinition = "TEXT")
    String bio;

    String otp;
    LocalDateTime expiresAt;
}
