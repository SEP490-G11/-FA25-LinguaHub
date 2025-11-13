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
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayOSService {

    private final PayOSProperties props;

    private final RestTemplate rest = new RestTemplate();
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

            String safeDesc = (description != null && description.length() > 25)
                    ? description.substring(0, 25) : description;

            // Tạo Item
            ItemData item = ItemData.builder()
                    .name(safeDesc)
                    .quantity(1)
                    .price(amount.intValue())
                    .build();

            // Tạo PaymentData cho signature
            PaymentData paymentData = PaymentData.builder()
                    .orderCode(orderCode)
                    .amount(amount.intValue())
                    .description(safeDesc)
                    .returnUrl(props.getReturnUrl())
                    .cancelUrl(props.getCancelUrl())
                    .item(item)
                    .build();

            // Tạo Signature đúng chuẩn
            String signature = SignatureUtils.createSignatureOfPaymentRequest(paymentData, props.getSecretKey());
            paymentData.setSignature(signature);

            // Build body gửi API raw
            Map<String, Object> body = mapper.convertValue(paymentData, Map.class);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", props.getClientId());
            headers.set("x-api-key", props.getApiKey());

            HttpEntity<?> entity = new HttpEntity<>(body, headers);

            String url = props.getEndpoint() + "/payment-requests";

            ResponseEntity<String> response = rest.postForEntity(url, entity, String.class);

            JsonNode root = mapper.readTree(response.getBody());
            JsonNode data = root.path("data");

            // Parse CheckoutResponseData từ JSON nhưng không lỗi expiredAt
            CheckoutResponseData checkout =
                    mapper.treeToValue(data, CheckoutResponseData.class);

            // Parse expiredAt thủ công
            // Parse expiredAt thủ công
            Instant expiredAt = null;

            if (data.has("expiredAt")) {
                String ex = data.get("expiredAt").asText();

                // Tránh crash khi PayOS trả "null" (string)
                if (ex != null &&
                        !ex.isBlank() &&
                        !"null".equalsIgnoreCase(ex)) {

                    try {
                        expiredAt = OffsetDateTime.parse(
                                ex,
                                DateTimeFormatter.ISO_OFFSET_DATE_TIME
                        ).toInstant();
                    } catch (Exception e) {
                        log.warn("[PAYOS WARN] expiredAt parse failed: {}", ex);
                        expiredAt = null;
                    }
                }
            }


            return new CheckoutWrapper(checkout, expiredAt);

        } catch (Exception e) {
            log.error("[PAYOS ERROR] {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public record CheckoutWrapper(
            CheckoutResponseData data,
            Instant expiredAt
    ) {}
}
