package edu.lms.controller;

import edu.lms.dto.request.PayOSWebhookRequest;
import edu.lms.service.PaymentWebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/payments/webhook")
@RequiredArgsConstructor
@Tag(name = "PayOS Webhook", description = "Receive PayOS payment status notifications")
public class PaymentWebhookController {

    private final PaymentWebhookService paymentWebhookService;

    @Value("${payos.secret-key}")
    private String secretKey;

    @Value("${payos.verify-signature:true}")
    private boolean verifySignature;

    @PostMapping
    @Operation(summary = "Receive PayOS webhook", description = "Callback from PayOS after payment success/failure")
    public ResponseEntity<?> handleWebhook(
            @RequestBody PayOSWebhookRequest request,
            @RequestHeader(value = "x-signature", required = false) String signature,
            @RequestHeader(value = "x-timestamp", required = false) String timestamp
    ) {
        log.info("🔔 [PAYOS WEBHOOK RECEIVED] orderCode={} | status={} | signature={} | timestamp={}",
                request.getOrderCode(), request.getStatus(), signature, timestamp);

        // Gọi service xử lý nghiệp vụ
        paymentWebhookService.handleWebhook(
                String.valueOf(request.getOrderCode()),
                request.getStatus(),
                null
        );

        return ResponseEntity.ok(
                java.util.Map.of(
                        "message", "Webhook processed successfully",
                        "orderCode", request.getOrderCode(),
                        "status", request.getStatus()
                )
        );
    }
}
