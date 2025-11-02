package edu.lms.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TutorBookingPlanRequest {

    @NotNull(message = "TutorID is required")
    Long tutorID;

    @NotBlank(message = "Title is required")
    String title;

    @NotBlank(message = "Description is required")
    String description;

    @NotNull(message = "Slot duration is required")
    @Min(15)
    Integer slotDuration;

    @NotNull(message = "Price per slot is required")
    @DecimalMin(value = "0.0", inclusive = false)
    BigDecimal pricePerSlot;

    @NotNull(message = "Start hour is required")
    @Min(0) @Max(23)
    Integer startHour;

    @NotNull(message = "End hour is required")
    @Min(1) @Max(24)
    Integer endHour;

    @NotBlank(message = "Active days are required")
    String activeDays; // Format: "Mon,Tue,Wed,Thu,Fri" - Max 5 days

    @NotNull(message = "Week to generate is required")
    @Min(1)
    Integer weekToGenerate;

    @Builder.Default
    Integer maxLearners = 1;
}
