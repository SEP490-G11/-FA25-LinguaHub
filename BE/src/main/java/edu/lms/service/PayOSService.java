package edu.lms.service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.lms.configuration.PayOSProperties;
import edu.lms.enums.PaymentType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;
import vn.payos.util.SignatureUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayOSService {

    private final PayOSProperties props;

    private final RestTemplate rest = new RestTemplate();

    // Bỏ qua field không tồn tại trong SDK (expiredAt, reference,…)
    private static final ObjectMapper mapper =
            new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public CheckoutWrapper createPaymentLink(
            Long userId,
            PaymentType type,
            Long targetId,
            BigDecimal amount,
            String description
    ) {
        try {
            long orderCode = System.currentTimeMillis() / 1000;

            // PayOS chỉ cho phép tối đa 25 ký tự
            String safeDesc = (description != null && description.length() > 25)
                    ? description.substring(0, 25)
                    : description;

            // Build Item
            ItemData item = ItemData.builder()
                    .name(safeDesc)
                    .quantity(1)
                    .price(amount.intValue())
                    .build();

            // Build PaymentData gửi lên PayOS
            PaymentData paymentData = PaymentData.builder()
                    .orderCode(orderCode)
                    .amount(amount.intValue())
                    .description(safeDesc)
                    .returnUrl(props.getReturnUrl())
                    .cancelUrl(props.getCancelUrl())
                    .item(item)
                    .build();

            // Tạo signature (bắt buộc)
            String signature = SignatureUtils.createSignatureOfPaymentRequest(
                    paymentData,
                    props.getSecretKey()
            );
            paymentData.setSignature(signature);

            // Convert sang JSON body
            Map<String, Object> body = mapper.convertValue(paymentData, Map.class);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", props.getClientId());
            headers.set("x-api-key", props.getApiKey());

            String url = props.getEndpoint() + "/payment-requests";

            // Gửi request sang PayOS
            ResponseEntity<String> response =
                    rest.postForEntity(url, new HttpEntity<>(body, headers), String.class);

            if (response.getBody() == null) {
                throw new RuntimeException("Empty response from PayOS");
            }

            JsonNode root = mapper.readTree(response.getBody());
            JsonNode data = root.path("data");

            // Parse response vào CheckoutResponseData (SDK không có trường expiredAt)
            CheckoutResponseData checkout =
                    mapper.treeToValue(data, CheckoutResponseData.class);

            //EXPIRED TIME DO BACKEND TỰ QUY ĐỊNH — KHÔNG LẤY TỪ PAYOS
            LocalDateTime expiredAt = LocalDateTime.now().plusMinutes(3); // 3 phút

            log.info("[PAYOS] Created payment link | orderCode={} | expiredAt_BE={}",
                    orderCode, expiredAt);

            return new CheckoutWrapper(checkout, expiredAt);

        } catch (Exception e) {
            log.error("[PAYOS ERROR] {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create PayOS link", e);
        }
    }

    public record CheckoutWrapper(
            CheckoutResponseData data,
            LocalDateTime expiredAt
    ) {}
}
