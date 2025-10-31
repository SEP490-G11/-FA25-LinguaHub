package edu.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

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
    String startHour;
    String endHour;
    String activeDays;
    Integer maxLearners;
    String tutorName;
}
