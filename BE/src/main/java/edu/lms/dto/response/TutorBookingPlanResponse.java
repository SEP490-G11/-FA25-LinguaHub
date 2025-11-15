package edu.lms.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TutorBookingPlanResponse {

    @JsonProperty("booking_planid")
    Long bookingPlanId;

    @JsonProperty("tutor_id")
    Long tutorId;

    String title;

    LocalDate date;

    @JsonProperty("start_hours")
    @JsonFormat(pattern = "HH:mm")
    LocalTime startTime;

    @JsonProperty("end_hours")
    @JsonFormat(pattern = "HH:mm")
    LocalTime endTime;

    @JsonProperty("slot_duration")
    Integer slotDuration;

    @JsonProperty("price_per_hours")
    BigDecimal pricePerHours;

    @JsonProperty("is_open")
    Boolean isOpen;

    @JsonProperty("is_active")
    Boolean isActive;
    @JsonProperty("meeting_url")
    String meetingUrl;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
