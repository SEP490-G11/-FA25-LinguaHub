package edu.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TutorBookingPlanResponse {
    Long bookingPlanID;
    String title;
    String description;
    Integer slotDuration;
    BigDecimal pricePerSlot;
    Integer startHour;
    Integer endHour;
    String activeDays;
    Integer maxLearners;
    Integer availableSlots;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    String tutorName;
}
