package edu.lms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.lms.service.PaymentWebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.PayOS;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payments/webhook-test")
@RequiredArgsConstructor
@Tag(name = "PayOS Webhook", description = "Receive PayOS payment status notifications")
public class PaymentWebhookController {

    private final PaymentWebhookService paymentWebhookService;
    private final PayOS payOS;
    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping
    @Operation(summary = "Receive PayOS webhook", description = "Callback from PayOS after payment success/failure")
    public ResponseEntity<?> handleWebhook(@RequestBody String rawBody) {
        try {
            log.info("📦 [PAYOS RAW WEBHOOK] body={}", rawBody);

            // Parse + verify signature bằng SDK (chuẩn theo docs mới)
            Webhook webhook = mapper.readValue(rawBody, Webhook.class);
            WebhookData data = payOS.verifyPaymentWebhookData(webhook);

            // Nếu tới đây không throw => signature hợp lệ
            log.info("Verified PayOS webhook: orderCode={} | code={} | desc={}",
                    data.getOrderCode(), data.getCode(), data.getDesc());

            // Tùy hệ thống: nếu muốn map trạng thái chi tiết thì đọc data.getCode()/getDesc()
            String status = "PAID";

            paymentWebhookService.handleWebhook(
                    String.valueOf(data.getOrderCode()),
                    status,
                    Map.of("code", data.getCode(), "desc", data.getDesc())
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Webhook processed successfully",
                    "orderCode", data.getOrderCode(),
                    "status", status
            ));
        } catch (Exception e) {
            // SDK ném lỗi nếu chữ ký sai / payload không hợp lệ
            log.error("Error verifying/handling PayOS webhook: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
