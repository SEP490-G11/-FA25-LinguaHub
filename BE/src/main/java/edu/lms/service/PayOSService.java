package edu.lms.service;

import edu.lms.dto.response.PayOSResponseDTO;
import edu.lms.enums.PaymentType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vn.payos.PayOS;


import java.math.BigDecimal;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class PayOSService {
    private final PayOS payOS; // vẫn giữ để verify webhook sau
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String PAYOS_URL = "https://api.payos.vn/v2/payment-requests";

    public PayOSResponseDTO.DataDTO createPaymentLink(
            Long userId, PaymentType type, Long targetId, BigDecimal amount, String description) {

        try {
            long orderCode = System.currentTimeMillis() / 1000;

            Map<String, Object> item = Map.of(
                    "name", description,
                    "quantity", 1,
                    "price", amount.intValue()
            );

            Map<String, Object> body = Map.of(
                    "orderCode", orderCode,
                    "amount", amount.intValue(),
                    "description", description,
                    "returnUrl", "https://linguahub.vercel.app/payment-success",
                    "cancelUrl", "https://linguahub.vercel.app/payment-cancel",
                    "items", new Object[]{item}
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", payOS.getClientId());
            headers.set("x-api-key", payOS.getApiKey());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<PayOSResponseDTO> response = restTemplate.exchange(
                    PAYOS_URL, HttpMethod.POST, entity, PayOSResponseDTO.class
            );

            return response.getBody().getData();

        } catch (Exception e) {
            log.error("[PAYOS ERROR] {}", e.getMessage(), e);
            throw new RuntimeException("PayOS error: " + e.getMessage());
        }
    }
}
