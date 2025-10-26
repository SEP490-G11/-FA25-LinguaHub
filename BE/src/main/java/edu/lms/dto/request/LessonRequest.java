package edu.lms.dto.request;

import edu.lms.enums.LessonType;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonRequest {

    @NotBlank(message = "Lesson title must not be blank")
    @Size(max = 255, message = "Lesson title must be less than 255 characters")
    String title;

    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 600, message = "Duration cannot exceed 600 minutes")
    Short duration;

    @NotNull(message = "Lesson type is required")
    LessonType lessonType;

    @Size(max = 255, message = "Video URL is too long")
    String videoURL;

    @Size(max = 5000, message = "Lesson content too long (max 5000 chars)")
    String content;

    Integer orderIndex;
}