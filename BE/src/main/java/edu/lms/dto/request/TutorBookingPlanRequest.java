package edu.lms.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TutorBookingPlanRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must be less than 100 characters")
    String title;

    @NotNull(message = "Date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate date;

    @NotNull(message = "Start time is required")
    @JsonProperty("start_hours")
    @JsonFormat(pattern = "HH:mm")
    LocalTime startTime;

    @NotNull(message = "End time is required")
    @JsonProperty("end_hours")
    @JsonFormat(pattern = "HH:mm")
    LocalTime endTime;

    @NotNull(message = "Slot duration is required")
    @JsonProperty("slot_duration")
    @Positive(message = "Slot duration must be greater than 0")
    Integer slotDuration;

    @NotNull(message = "Price per hours is required")
    @JsonProperty("price_per_hours")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price per hour must be greater than 0")
    BigDecimal pricePerHours;
}
