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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userID", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookingPlanID", nullable = false)
    BookingPlan bookingPlan;

    /** Ngày bắt đầu kích hoạt gói học — chỉ set khi payment thành công */
    LocalDateTime startDate;

    /** Số slot người dùng mua */
    @Column(nullable = false)
    Integer purchasedSlots;

    /** Số slot còn lại có thể sử dụng */
    @Column(nullable = false)
    Integer remainingSlots;

    /** Trạng thái hoạt động của gói (false = chưa thanh toán / chưa kích hoạt) */
    @Column(nullable = false)
    @Builder.Default
    Boolean isActive = false;

    @OneToMany(mappedBy = "userBookingPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    List<UserBookingPlanBenefit> userBookingPlanBenefits;

    /** Tiện ích: tự set thời gian bắt đầu khi active */
    public void activate() {
        this.isActive = true;
        this.startDate = LocalDateTime.now();
    }
}
