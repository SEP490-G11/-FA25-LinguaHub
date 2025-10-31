package edu.lms.controller;

import edu.lms.service.PayOSService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final PayOSService payOSService;

    //PayOS sẽ gọi POST đến endpoint này khi người dùng thanh toán xong
    @PostMapping("/webhook")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> payload) {
        log.info("Webhook received from PayOS: {}", payload);

        try {
            // PayOS gửi các field: orderCode, status, amount, ...
            String orderCode = String.valueOf(payload.get("orderCode"));
            String status = String.valueOf(payload.get("status"));

            // Gọi service xử lý logic cập nhật DB
            payOSService.handleWebhook(orderCode, status, payload);

            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            log.error(" Error while processing webhook: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }
}
