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
@Table(name = "BookingPlanBenefit")
public class BookingPlanBenefit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long benefitID;

    String title;
    String description;
    Integer numberUsage;

    @ManyToOne
    @JoinColumn(name = "bookingPlanID")
    BookingPlan bookingPlan;
}
