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
@RequestMapping("/api/payments/webhook")
@RequiredArgsConstructor
@Tag(name = "PayOS Webhook", description = "Receive PayOS payment status notifications")
public class PaymentWebhookController {

    private final PaymentWebhookService paymentWebhookService;
    private final PayOS payOS;
    private final ObjectMapper mapper; // ✅ inject từ Spring

    @PostMapping
    @Operation(summary = "Receive PayOS webhook", description = "Callback from PayOS after payment success/failure")
    public ResponseEntity<Map<String, Object>> handleWebhook(@RequestBody String rawBody) {
        try {
            log.info("[PAYOS WEBHOOK] Received payload ({} bytes)", rawBody.length());

            // Parse + verify chữ ký
            Webhook webhook = mapper.readValue(rawBody, Webhook.class);
            WebhookData data = payOS.verifyPaymentWebhookData(webhook);

            log.info("[PAYOS VERIFIED] orderCode={} | code={} | desc={}",
                    data.getOrderCode(), data.getCode(), data.getDesc());

            String status = "00".equals(data.getCode()) ? "PAID" : "FAILED";

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
            log.error("[PAYOS WEBHOOK] Verification failed: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of(
                    "message", "Webhook received but verification failed",
                    "error", e.getMessage()
            ));
        }
    }
}
