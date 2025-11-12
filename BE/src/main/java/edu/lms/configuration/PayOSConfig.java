//package edu.lms.configuration;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import vn.payos.PayOS;
//
//@Configuration
//public class PayOSConfig {
//
//    @Value("${payos.client-id}")
//    private String clientId;
//
//    @Value("${payos.api-key}")
//    private String apiKey;
//
//    @Value("${payos.secret-key}")
//    private String secretKey;
//
//    @Bean
//    public PayOS payOS() {
//        // SDK sẽ dùng 3 tham số này để verify chữ ký webhook
//        return new PayOS(clientId, apiKey, secretKey);
//    }
//}
