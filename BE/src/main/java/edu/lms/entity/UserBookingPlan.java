package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "UserBookingPlans")
public class UserBookingPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long userBookingPlanID;

    @ManyToOne
    @JoinColumn(name = "userID", nullable = false)
    User user;

    @ManyToOne
    @JoinColumn(name = "bookingPlanID", nullable = false)
    BookingPlan bookingPlan;

    @Builder.Default
    LocalDateTime startDate = LocalDateTime.now();

    @Builder.Default
    Boolean isActive = true;

    @OneToMany(mappedBy = "userBookingPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    List<UserBookingPlanBenefit> userBookingPlanBenefits;
}
