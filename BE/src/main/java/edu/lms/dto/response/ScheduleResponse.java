package edu.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScheduleResponse {
    Long scheduleID;
    Long tutorID;
    Long bookingPlanID;
    LocalDateTime startTime;
    LocalDateTime endTime;
    Boolean isAvailable;
}

