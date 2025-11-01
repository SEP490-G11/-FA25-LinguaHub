package edu.lms.service;

import edu.lms.enums.PaymentType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
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

    @Value("${payos.secret-key}")
    private String secretKey;

    private static final String PAYOS_API_URL = "https://httpbin.org/post";

    public ResponseEntity<?> createPaymentLink(Long userId, PaymentType type, Long targetId, BigDecimal amount, String description) {
        try {
            String orderCode = type + "-" + targetId + "-" + UUID.randomUUID();

            Map<String, Object> body = new HashMap<>();
            body.put("orderCode", orderCode);
            body.put("amount", amount);
            body.put("description", description);
            body.put("returnUrl", "https://linguahub.vercel.app/payment-success");
            body.put("cancelUrl", "https://linguahub.vercel.app/payment-cancel");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", apiKey);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response;
            try {
                log.info("Sending request to PayOS mock API...");
                response = restTemplate.postForEntity(PAYOS_API_URL, requestEntity, Map.class);
                log.info("Received response from PayOS: {}", response.getBody());
            } catch (Exception ex) {
                log.warn("PayOS not reachable, using mock response: {}", ex.getMessage());
                response = ResponseEntity.ok(Map.of("data", "mock"));
            }

            Map<String, Object> data = new HashMap<>();
            data.put("checkoutUrl", "https://linguahub.vercel.app/payment/checkout");
            data.put("qrCode", "https://linguahub.vercel.app/qr/test.png");
            data.put("paymentLinkId", "MOCK-" + orderCode);

            return ResponseEntity.ok(Map.of(
                    "message", "Payment link generated successfully",
                    "orderCode", orderCode,
                    "data", data
            ));

        } catch (Exception e) {
            log.error("PayOS request failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("code", 9999, "message", e.getMessage()));
        }
    }
}
