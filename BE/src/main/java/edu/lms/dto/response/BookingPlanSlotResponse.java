package edu.lms.dto.response;

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
    Long slotID;
    Long bookingPlanID;
    Long tutorID;
    Long userID; // Learner đã book slot (null nếu chưa có ai book)
    LocalDateTime startTime;
    LocalDateTime endTime;
    Long paymentID; // Payment ID nếu đã thanh toán
    SlotStatus status; // Locked hoặc Paid
    LocalDateTime lockedAt;
    LocalDateTime expiresAt; // Slot hết hạn nếu chưa thanh toán
    String learnerName; // Tên learner nếu đã book (optional, có thể null)
}

