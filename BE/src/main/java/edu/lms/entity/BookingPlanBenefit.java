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

    @Column(length = 255)
    String title;

    @Column(columnDefinition = "TEXT")
    String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookingPlanID")
    BookingPlan bookingPlan;
}
