package edu.lms.service;

import edu.lms.entity.Payment;
import edu.lms.enums.PaymentMethod;
import edu.lms.enums.PaymentStatus;
import edu.lms.enums.PaymentType;
import edu.lms.repository.PaymentRepository;
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

    private final PaymentRepository paymentRepository;
    private final RestTemplate restTemplate;

    public PayOSService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
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

            Map<String, Object> responseBody = response.getBody();
            Map<String, Object> data = new HashMap<>();

            if (responseBody != null) {
                Object dataObj = responseBody.get("data");
                if (dataObj instanceof Map) {
                    data = (Map<String, Object>) dataObj;
                } else {
                    log.warn("PayOS returned string instead of map: {}", dataObj);
                    data.put("checkoutUrl", "https://linguahub.vercel.app/payment/checkout");
                    data.put("qrCode", "https://linguahub.vercel.app/qr/test.png");
                    data.put("paymentLinkId", "MOCK-" + orderCode);
                }
            } else {
                log.warn("Empty response body from PayOS");
                data.put("checkoutUrl", "https://linguahub.vercel.app/payment/checkout");
                data.put("qrCode", "https://linguahub.vercel.app/qr/test.png");
                data.put("paymentLinkId", "MOCK-" + orderCode);
            }

            Payment payment = Payment.builder()
                    .orderCode(orderCode)
                    .paymentType(type)
                    .paymentMethod(PaymentMethod.PAYOS)
                    .amount(amount)
                    .status(PaymentStatus.PENDING)
                    .checkoutUrl((String) data.get("checkoutUrl"))
                    .qrCodeUrl((String) data.get("qrCode"))
                    .paymentLinkId((String) data.get("paymentLinkId"))
                    .isPaid(false)
                    .build();

            paymentRepository.save(payment);
            log.info("Payment created successfully: {}", orderCode);

            return ResponseEntity.ok(Map.of(
                    "message", "Payment created successfully",
                    "data", data
            ));

        } catch (Exception e) {
            log.error("PayOS request failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("code", 9999, "message", e.getMessage()));
        }
    }

    public void handleWebhook(String orderCode, String status, Map<String, Object> payload) {
        paymentRepository.findByOrderCode(orderCode).ifPresent(payment -> {
            switch (status.toUpperCase()) {
                case "PAID":
                case "SUCCESS":
                    payment.setStatus(PaymentStatus.PAID);
                    payment.setPaidAt(java.time.LocalDateTime.now());
                    payment.setIsPaid(true);
                    break;
                case "FAILED":
                    payment.setStatus(PaymentStatus.FAILED);
                    break;
                case "CANCELLED":
                    payment.setStatus(PaymentStatus.CANCELLED);
                    break;
                default:
                    payment.setStatus(PaymentStatus.PENDING);
            }

            payment.setTransactionResponse(payload.toString());
            paymentRepository.save(payment);
            log.info("Webhook processed for orderCode={}, status={}", orderCode, status);
        });
    }
}
