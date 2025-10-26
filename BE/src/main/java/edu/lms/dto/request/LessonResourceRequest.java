package edu.lms.dto.request;

import edu.lms.enums.ResourceType;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonResourceRequest {

    @NotNull(message = "Resource type is required")
    ResourceType resourceType;

    @Size(max = 255, message = "Resource title must be less than 255 characters")
    String resourceTitle;

    @NotBlank(message = "Resource URL must not be empty")
    @Pattern(regexp = "^(http|https)://.*$", message = "Invalid resource URL format")
    String resourceURL;
}
