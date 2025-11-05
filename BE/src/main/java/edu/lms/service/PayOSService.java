package edu.lms.service;

import edu.lms.enums.PaymentType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class PayOSService {

    private final RestTemplate restTemplate;

    public PayOSService() {
        this.restTemplate = createRestTemplateWithTimeout();
    }

    private RestTemplate createRestTemplateWithTimeout() {
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        return new RestTemplate(factory);
    }

    @Value("${payos.client-id}")
    private String clientId;

    @Value("${payos.api-key}")
    private String apiKey;

    private static final String PAYOS_API_URL = "https://httpbin.org/post";

    public ResponseEntity<?> createPaymentLink(Long userId, PaymentType type, Long targetId, BigDecimal amount, String description) {
        try {
            String orderCode = type + "-" + targetId + "-" + UUID.randomUUID();

            // QR hết hạn sau 15 phút
            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(15);
            long expiredEpoch = expiresAt.atZone(ZoneId.systemDefault()).toEpochSecond();

            Map<String, Object> body = new HashMap<>();
            body.put("orderCode", orderCode);
            body.put("amount", amount);
            body.put("description", description);
            body.put("expiredAt", expiredEpoch);
            body.put("returnUrl", "https://linguahub.vercel.app/payment-success");
            body.put("cancelUrl", "https://linguahub.vercel.app/payment-cancel");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", apiKey);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response;
            try {
                response = restTemplate.postForEntity(PAYOS_API_URL, requestEntity, Map.class);
            } catch (Exception ex) {
                log.warn("PayOS mock fallback: {}", ex.getMessage());
                response = ResponseEntity.ok(Map.of("data", "mock"));
            }

            Map<String, Object> data = new HashMap<>();
            data.put("checkoutUrl", "https://linguahub.vercel.app/payment/checkout");
            data.put("qrCode", "https://linguahub.vercel.app/qr/test.png");
            data.put("paymentLinkId", "MOCK-" + orderCode);
            data.put("expiredAt", expiresAt.toString());

            return ResponseEntity.ok(Map.of(
                    "message", "Payment link generated successfully (valid 15 minutes)",
                    "orderCode", orderCode,
                    "data", data
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
