package edu.lms.service;

import edu.lms.enums.PaymentType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayOSService {

    private final PayOS payOS;

    public CheckoutResponseData createPaymentLink(
            Long userId,
            PaymentType type,
            Long targetId,
            BigDecimal amount,
            String description
    ) {
        try {
            long orderCode = System.currentTimeMillis() / 1000;

            // 🔹 PayOS yêu cầu description <= 25 ký tự
            String safeDescription = description.length() > 25
                    ? description.substring(0, 25)
                    : description;

            ItemData item = ItemData.builder()
                    .name(safeDescription)
                    .quantity(1)
                    .price(amount.intValue())
                    .build();

            PaymentData paymentData = PaymentData.builder()
                    .orderCode(orderCode)
                    .amount(amount.intValue())
                    .description(safeDescription)
                    .returnUrl("http://localhost:3000/payment-success?orderCode=" + orderCode + "&courseId=" + targetId)
                    .cancelUrl("http://localhost:3000/course/" + targetId)
                    .item(item)
                    .build();

            // 🔹 Gọi SDK để tạo link thanh toán
            CheckoutResponseData checkout = payOS.createPaymentLink(paymentData);

            log.info("[PAYOS LINK CREATED] orderCode={}, amount={}, desc={}",
                    orderCode, amount, safeDescription);

            return checkout;
        } catch (Exception e) {
            log.error("[PAYOS ERROR] Failed to create link: {}", e.getMessage());
            throw new RuntimeException("PayOS error: " + e.getMessage());
        }
    }
}
