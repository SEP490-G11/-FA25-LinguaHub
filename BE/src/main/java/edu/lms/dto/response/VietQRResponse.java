package edu.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VietQRResponse {
    String qrImage;          // Base64 ảnh QR
    String description;      // Nội dung chuyển khoản
    BigDecimal amount;       // Số tiền
    String bankCode;         // Mã ngân hàng
    String accountNo;        // Số tài khoản
    String accountName;      // Tên người nhận
}
