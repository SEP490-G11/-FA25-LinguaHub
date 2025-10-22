package edu.lms.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TutorApplyRequest {

    @NotNull(message = "Experience is required")
    @Min(value = 0, message = "Experience must be >= 0")
    @Max(value = 60, message = "Experience must be <= 60")
    Short experience;

    @NotBlank(message = "Specialization is required")
    @Size(max = 255, message = "Specialization must be <= 255 characters")
    String specialization;

    @NotBlank(message = "Teaching language is required")
    @Size(max = 100, message = "Teaching language must be <= 100 characters")
    String teachingLanguage;

    @NotBlank(message = "Bio is required")
    @Size(max = 1000, message = "Bio must be <= 1000 characters")
    String bio;

    @Size(max = 255, message = "Certificate Name must be <= 255 characters")
    String certificateName;

    @NotBlank(message = "Document URL is required")
    @Size(max = 255, message = "Document URL must be <= 255 characters")
    String documentURL;
}
