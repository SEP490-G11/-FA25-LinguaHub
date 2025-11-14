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
    private final ObjectMapper mapper;

    @PostMapping
    @Operation(summary = "Receive PayOS webhook", description = "Callback from PayOS after payment result")
    public ResponseEntity<Map<String, Object>> handleWebhook(@RequestBody String rawBody) {
        try {
            log.info("[PAYOS WEBHOOK] RAW BODY = {}", rawBody);

            // Parse JSON
            Webhook webhook = mapper.readValue(rawBody, Webhook.class);

            // Verify signature
            WebhookData data = payOS.verifyPaymentWebhookData(webhook);

            Long orderCode = data.getOrderCode();
            String code = data.getCode();   // "00" = SUCCESS
            String desc = data.getDesc();   // description text

            log.info("[PAYOS VERIFIED] orderCode={} | code={} | desc={}",
                    orderCode, code, desc);

            // Forward to service
            paymentWebhookService.handleWebhook(
                    String.valueOf(orderCode),
                    code,     // <-- code quyết định PAID hay FAILED
                    Map.of(
                            "code", code,
                            "desc", desc
                    )
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Webhook processed successfully",
                    "orderCode", orderCode,
                    "status", code
            ));

        } catch (Exception e) {
            log.error("[PAYOS WEBHOOK ERROR] {}", e.getMessage(), e);

            return ResponseEntity.ok(Map.of(
                    "message", "Webhook received but verification failed",
                    "error", e.getMessage()
            ));
        }
    }
}
