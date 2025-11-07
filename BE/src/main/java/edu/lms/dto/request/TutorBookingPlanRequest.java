package edu.lms.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TutorBookingPlanRequest {

    @NotNull(message = "TutorID is required")
    Long tutorID;

    @NotBlank(message = "Title is required")
    @Pattern(regexp = "^(T2|T3|T4|T5|T6|T7|CN)$", message = "Title must be one of: T2, T3, T4, T5, T6, T7, CN")
    String title; // Thứ trong tuần: T2, T3, T4, T5, T6, T7, CN

    @NotNull(message = "Start hours is required")
    @Min(0) @Max(23)
    Integer startHours; // Giờ bắt đầu (0-23)

    @NotNull(message = "End hours is required")
    @Min(1) @Max(24)
    Integer endHours; // Giờ kết thúc (1-24)

    @NotNull(message = "Slot duration is required")
    @Min(value = 15, message = "Slot duration must be at least 15 minutes")
    Integer slotDuration; // Độ dài mỗi slot (phút)

    @NotNull(message = "Price per hours is required")
    @Min(value = 0, message = "Price per hours must be greater than or equal to 0")
    Double pricePerHours; // Giá mỗi giờ

    @NotNull(message = "Week to generate is required")
    @Min(1)
    Integer weekToGenerate; // Số tuần cần generate slots
}
