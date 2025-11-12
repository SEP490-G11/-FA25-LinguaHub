package edu.lms.controller;

import edu.lms.dto.request.PaymentRequest;
import edu.lms.dto.response.PaymentResponse;
import edu.lms.entity.Payment;
import edu.lms.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    // ======================================================
    // 🟢 1. TẠO YÊU CẦU THANH TOÁN (PAYOS)
    // ======================================================
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequest request) {
        log.info("[CREATE PAYMENT] userId={} | targetId={} | type={}",
                request.getUserId(), request.getTargetId(), request.getPaymentType());

        try {
            return paymentService.createPayment(request);
        } catch (Exception e) {
            log.error("[CREATE PAYMENT FAILED] {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to create payment",
                    "message", e.getMessage()
            ));
        }
    }

    // ======================================================
    // 🟢 2. WEBHOOK - PAYOS GỌI SAU KHI THANH TOÁN
    // ======================================================
    @PostMapping("/webhook")
    public ResponseEntity<?> handlePayOSWebhook(@RequestBody Map<String, Object> payload) {
        log.info("[PAYOS WEBHOOK] Payload: {}", payload);

        try {
            // PayOS gửi về data chứa orderCode & status
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            if (data == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing data in webhook"));
            }

            String orderCode = String.valueOf(data.get("orderCode"));
            String status = String.valueOf(data.get("status"));

            log.info("[PAYOS WEBHOOK] orderCode={} | status={}", orderCode, status);

            Payment payment = paymentService.getPaymentByOrderCode(orderCode);
            if (payment == null) {
                log.warn("[PAYOS WEBHOOK] Payment not found for orderCode={}", orderCode);
                return ResponseEntity.ok(Map.of("message", "Payment not found (ignored)"));
            }

            // Cập nhật trạng thái thanh toán
            if ("PAID".equalsIgnoreCase(status)) {
                payment.setStatus(edu.lms.enums.PaymentStatus.PAID);
                paymentService.processPostPayment(payment);
                log.info("[PAYMENT SUCCESS] Payment {} marked as PAID", payment.getPaymentID());
            } else if ("CANCELLED".equalsIgnoreCase(status)) {
                payment.setStatus(edu.lms.enums.PaymentStatus.CANCELLED);
            } else {
                payment.setStatus(edu.lms.enums.PaymentStatus.FAILED);
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Webhook processed",
                    "orderCode", orderCode,
                    "status", status
            ));
        } catch (Exception e) {
            log.error("[PAYOS WEBHOOK ERROR] {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Webhook handling failed",
                    "message", e.getMessage()
            ));
        }
    }

    // ======================================================
    // 🟢 3. GET PAYMENT (LEARNER)
    // ======================================================
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getPaymentsByUser(userId));
    }

    // ======================================================
    // 🟢 4. GET PAYMENT (TUTOR)
    // ======================================================
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByTutor(@PathVariable Long tutorId) {
        return ResponseEntity.ok(paymentService.getPaymentsByTutor(tutorId));
    }

    // ======================================================
    // 🟢 5. GET PAYMENT (ADMIN)
    // ======================================================
    @GetMapping("/all")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
}
