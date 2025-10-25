package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "UserServiceBenefit")
public class UserServiceBenefit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long userServiceBenefitID;

    @ManyToOne
    @JoinColumn(name = "userServiceID")
    UserService userService;

    String title;
    String description;
    Integer numberUsageRemaining = 0;
    Integer numberBooking = 0;
}
