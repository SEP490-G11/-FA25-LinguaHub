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
@Table(name = "UserBookingPlanBenefit")
public class UserBookingPlanBenefit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long userBookingPlanBenefitID;

    @ManyToOne
    @JoinColumn(name = "userBookingPlanID")
    UserBookingPlan userBookingPlan;

    String title;
    String description;
    Integer numberUsageRemaining = 0;
    Integer numberBooking = 0;
}
