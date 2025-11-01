package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "BookingPlans")
public class BookingPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long bookingPlanID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutorID", nullable = false)
    Tutor tutor;

    @Column(nullable = false, length = 255)
    String title;

    @Column(columnDefinition = "TEXT")
    String description;

    /** Thời lượng mỗi slot (VD: 30 phút) */
    @Builder.Default
    Integer slotDuration = 30;

    /** Giá cho mỗi slot */
    @Column(precision = 10, scale = 2, nullable = false)
    @Builder.Default
    BigDecimal pricePerSlot = BigDecimal.ZERO;

    /** Giờ bắt đầu dạy (VD: 12h) */
    @Builder.Default
    Integer startHour = 12;

    /** Giờ kết thúc dạy (VD: 20h) */
    @Builder.Default
    Integer endHour = 20;

    /** Các ngày hoạt động (VD: Mon,Tue,Wed,Thu,Fri) */
    @Builder.Default
    String activeDays = "Mon,Tue,Wed,Thu,Fri";

    /** Số lượng học viên tối đa được phép đặt cùng slot (dự phòng mở rộng) */
    @Builder.Default
    Integer maxLearners = 1;

    /** Số lượng slot còn khả dụng mà tutor có thể bán */
    @Builder.Default
    Integer availableSlots = 0;

    /** Thời điểm tạo và cập nhật */
    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /** Danh sách lợi ích (benefits) kèm theo plan */
    @OneToMany(mappedBy = "bookingPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    List<BookingPlanBenefit> benefits;
}
