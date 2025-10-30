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
@Table(name = "UserBookingPlan")
public class UserBookingPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long userBookingPlanID;

    @ManyToOne
    @JoinColumn(name = "userID")
    User user;

    @ManyToOne
    @JoinColumn(name = "bookingPlanID")
    BookingPlan bookingPlan;

    LocalDateTime startDate = LocalDateTime.now();
    Boolean isActive = true;
    String title;
    Integer duration;

    @OneToMany(mappedBy = "userBookingPlan", cascade = CascadeType.ALL)
    List<UserBookingPlanBenefit> userBookingPlanBenefits;
}
