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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userBookingPlanID")
    UserBookingPlan userBookingPlan;

    @Column(length = 255)
    String title;

    @Column(columnDefinition = "TEXT")
    String description;

    @Builder.Default
    Integer numberUsageRemaining = 0;

    @Builder.Default
    Integer numberBooking = 0;
}
