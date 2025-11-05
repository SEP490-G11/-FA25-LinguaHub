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
public class TutorCourseRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255)
    String title;

    @NotBlank(message = "Description is required")
    String description;

    @NotNull(message = "Duration is required")
    @Min(1)
    Integer duration;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false)
    BigDecimal price;

    @NotBlank(message = "Language is required")
    String language;

    @NotBlank(message = "Thumbnail URL is required")
    String thumbnailURL;

    @NotNull(message = "Category ID is required")
    Long categoryID;
}
