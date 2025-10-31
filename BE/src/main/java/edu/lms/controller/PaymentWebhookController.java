package edu.lms.controller;

import edu.lms.service.PaymentWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payments/webhook")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final PaymentWebhookService paymentWebhookService;

    @PostMapping
    public ResponseEntity<?> handleWebhook(@RequestBody Map<String, Object> payload) {
        log.info("📩 Received PayOS webhook: {}", payload);

        String orderCode = (String) payload.get("orderCode");
        String status = (String) payload.get("status");

        paymentWebhookService.handleWebhook(orderCode, status, payload);
        return ResponseEntity.ok(Map.of("message", "Webhook processed successfully"));
    }
}
