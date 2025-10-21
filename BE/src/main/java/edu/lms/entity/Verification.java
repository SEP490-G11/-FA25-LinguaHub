package edu.lms.entity;

import edu.lms.enums.VerificationType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "Verification")
public class Verification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long verificationID;

    @ManyToOne
    @JoinColumn(name = "userID", nullable = false)
    User user;

    @Enumerated(EnumType.STRING)
    VerificationType type;

    String code;
    LocalDateTime expiredAt;
    Boolean isVerified = false;
}
