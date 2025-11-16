package edu.lms.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import edu.lms.enums.SlotStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingPlanSlotResponse {
    
    @JsonProperty("slotid")
    Long slotID;
    
    @JsonProperty("booking_planid")
    Long bookingPlanID;
    
    @JsonProperty("tutor_id")
    Long tutorID;
    
    @JsonProperty("user_id")
    Long userID; // Learner đã book slot (null nếu chưa có ai book)
    
    @JsonProperty("start_time")
    LocalDateTime startTime;
    
    @JsonProperty("end_time")
    LocalDateTime endTime;
    
    @JsonProperty("payment_id")
    Long paymentID; // Payment ID nếu đã thanh toán
    
    SlotStatus status; // Locked hoặc Paid
    
    @JsonProperty("locked_at")
    LocalDateTime lockedAt;
    
    @JsonProperty("expires_at")
    LocalDateTime expiresAt; // Slot hết hạn nếu chưa thanh toán
    
    @JsonProperty("learner_name")
    String learnerName; // Tên learner nếu đã book (optional, có thể null)
}

