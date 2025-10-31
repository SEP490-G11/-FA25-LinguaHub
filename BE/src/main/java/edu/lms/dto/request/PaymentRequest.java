package edu.lms.dto.request;

import edu.lms.enums.PaymentType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRequest {
    PaymentType paymentType; // COURSE hoặc BOOKING
    Long targetId; // CourseID hoặc UserBookingPlanID
    Long userId;   // Người thanh toán
}
