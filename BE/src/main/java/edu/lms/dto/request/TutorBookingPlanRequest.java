package edu.lms.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    @NotNull(message = "Duration is required")
    @Min(1)
    Integer duration;

    @NotBlank(message = "Description is required")
    String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false)
    BigDecimal price;
}
