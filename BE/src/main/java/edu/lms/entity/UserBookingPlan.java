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

    // Ngày bắt đầu kích hoạt gói học
    @Builder.Default
    LocalDateTime startDate = LocalDateTime.now();

    // Số slot người dùng mua
    @Builder.Default
    Integer purchasedSlots = 1;

    // Số slot còn lại có thể sử dụng
    @Builder.Default
    Integer remainingSlots = 1;

    // Trạng thái hoạt động của gói
    @Builder.Default
    Boolean isActive = true;

    @OneToMany(mappedBy = "userBookingPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    List<UserBookingPlanBenefit> userBookingPlanBenefits;
}
