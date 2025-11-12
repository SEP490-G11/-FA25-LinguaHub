package edu.lms.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class VietQRService {

    private static final String API_URL = "https://api.vietqr.io/v2/generate";

    public String generateQR(String bankCode, String accountNo, String accountName,
                             int amount, String description) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            //Cấu trúc body đúng chuẩn VietQR API
            Map<String, Object> body = new HashMap<>();
            body.put("accountNo", accountNo);
            body.put("accountName", accountName);
            body.put("acqId", bankCode); // Mã ngân hàng (VD: 970422 - MB Bank)
            body.put("amount", amount);
            body.put("addInfo", description);
            body.put("template", "compact"); // compact | print | qr_only

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(API_URL, HttpMethod.POST, request, Map.class);

            Map<String, Object> resBody = response.getBody();
            if (resBody == null) {
                throw new RuntimeException("Empty response from VietQR");
            }

            if (!"00".equals(String.valueOf(resBody.get("code")))) {
                throw new RuntimeException("VietQR API error: " + resBody);
            }

            Map<String, Object> data = (Map<String, Object>) resBody.get("data");
            return (String) data.get("qrDataURL"); // URL ảnh QR (base64 hoặc link ảnh)
        } catch (Exception e) {
            log.error("[VietQR ERROR] {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate VietQR: " + e.getMessage());
        }
    }
}
