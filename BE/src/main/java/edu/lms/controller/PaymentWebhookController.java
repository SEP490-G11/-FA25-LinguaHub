package edu.lms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.lms.service.PaymentWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Hex;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payments/webhook")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final PaymentWebhookService paymentWebhookService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${payos.secret-key}")
    private String secretKey;

    @Value("${payos.verify-signature:true}") // Cho phép bật/tắt xác thực khi test
    private boolean verifySignature;

    /**
     *Webhook từ PayOS gửi về khi có thay đổi trạng thái thanh toán
     */
    @PostMapping
    public ResponseEntity<?> handleWebhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "x-signature", required = false) String signature,
            @RequestHeader(value = "x-timestamp", required = false) String timestamp
    ) {
        try {
            log.info("🔔 [PAYOS WEBHOOK RECEIVED] signature={} | timestamp={} | body={}",
                    signature, timestamp, rawBody);

            // ==============================
            //Bỏ qua xác thực khi đang test
            // ==============================
            if (!verifySignature) {
                log.warn("⚠️ [DEV MODE] Skipping PayOS signature verification.");
                Map<String, Object> payload = objectMapper.readValue(rawBody, Map.class);
                return processWebhook(payload);
            }

            // ==============================
            //Kiểm tra thời gian (anti-replay)
            // ==============================
            if (timestamp != null) {
                long sentAt = Long.parseLong(timestamp);
                long now = System.currentTimeMillis() / 1000;
                if (Math.abs(now - sentAt) > 300) { // 5 phút
                    log.warn("⚠️ Webhook rejected: timestamp too old ({}s diff)", Math.abs(now - sentAt));
                    return ResponseEntity.status(400).body(Map.of("error", "Expired webhook"));
                }
            }

            // ==============================
            //Xác thực chữ ký HMAC (bảo mật)
            // ==============================
            if (signature == null) {
                log.warn("Missing x-signature header");
                return ResponseEntity.status(401).body(Map.of("error", "Missing x-signature"));
            }

            String expectedSignature = generateHmac(rawBody, secretKey);
            if (!expectedSignature.equals(signature)) {
                log.warn("Invalid webhook signature from PayOS");
                return ResponseEntity.status(401).body(Map.of("error", "Invalid signature"));
            }

            // ==============================
            //Parse payload & xử lý nghiệp vụ
            // ==============================
            Map<String, Object> payload = objectMapper.readValue(rawBody, Map.class);
            return processWebhook(payload);

        } catch (Exception e) {
            log.error("🔥 Webhook error: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Xử lý chính sau khi xác thực
     */
    private ResponseEntity<?> processWebhook(Map<String, Object> payload) {
        String orderCode = String.valueOf(payload.get("orderCode"));
        String status = String.valueOf(payload.get("status"));

        log.info("[PAYOS VERIFIED] orderCode={} | status={}", orderCode, status);

        // Gọi service xử lý nghiệp vụ (cập nhật DB)
        paymentWebhookService.handleWebhook(orderCode, status, payload);

        return ResponseEntity.ok(Map.of(
                "message", "Webhook processed successfully",
                "orderCode", orderCode,
                "status", status
        ));
    }

    /**
     *Sinh chữ ký HMAC-SHA256 để so sánh với chữ ký PayOS gửi
     */
    private String generateHmac(String data, String secret) throws Exception {
        Mac sha256 = Mac.getInstance("HmacSHA256");
        sha256.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return Hex.encodeHexString(sha256.doFinal(data.getBytes(StandardCharsets.UTF_8)));
    }
}
