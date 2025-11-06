package edu.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TutorBookingPlanResponse {
    Long bookingPlanID;
    String title; // T2, T3, T4, T5, T6, T7, CN
    Integer startHours;
    Integer endHours;
    Integer slotDuration;
    Double pricePerHours;
    Boolean isActive;
    Boolean isOpen;
    Long tutorID;
    Integer numberOfGeneratedSlots; // Số lượng slots đã được tạo
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
