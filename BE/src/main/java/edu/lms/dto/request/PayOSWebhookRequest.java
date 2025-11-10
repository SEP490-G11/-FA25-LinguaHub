package edu.lms.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "PayOS Webhook payload sent to backend")
public class PayOSWebhookRequest {

    @Schema(description = "Mã đơn hàng", example = "1762802727")
    Long orderCode;

    @Schema(description = "Trạng thái thanh toán", example = "PAID")
    String status;

    @Schema(description = "Số tiền thanh toán (VND)", example = "500000")
    BigDecimal amount;

    @Schema(description = "Mô tả giao dịch", example = "CSSTSF1I9R3 Course Basic English Com")
    String description;

    @Schema(description = "Số tài khoản người nhận", example = "0964472908")
    String accountNumber;

    @Schema(description = "Tên tài khoản người nhận", example = "NGUYEN DUC TRUNG")
    String accountName;

    @Schema(description = "ID của link thanh toán", example = "3a46042eb4c44d34a7f4cd860f834957")
    String paymentLinkId;

    @Schema(description = "Thời gian giao dịch", example = "2025-11-11T02:35:00")
    LocalDateTime transactionDateTime;

    @Schema(description = "Mã QR thanh toán", example = "0002010102123854...63046C8C")
    String qrCode;

    @Schema(description = "Chữ ký HMAC-SHA256 của PayOS", example = "d47e3e1f2b3e6a...")
    String signature;
}
