package edu.lms.dto.response;

import edu.lms.enums.RefundStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RefundRequestResponse {

    Long refundRequestId;

    Long bookingPlanId;
    Long slotId;

    BigDecimal refundAmount;

    RefundStatus status;

    LocalDateTime createdAt;
    LocalDateTime processedAt;

    // optional: để show thêm thông tin trên UI nếu cần
    String bankName;
    String bankOwnerName;
    String bankAccountNumber;
}
