package edu.lms.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PayOSResponseDTO {
    private String code;
    private String desc;
    private DataDTO data;
    private String signature;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DataDTO {
        private String bin;
        private String accountNumber;
        private String accountName;
        private String currency;
        private String paymentLinkId;
        private int amount;
        private String description;
        private long orderCode;
        private Long expiredAt; // optional
        private String status;
        private String checkoutUrl;
        private String qrCode;
    }
}
