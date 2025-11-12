package edu.lms.service;

import edu.lms.configuration.MBBankConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MBBankService {

    private final MBBankConfig mbBankConfig;

    private static final String MB_TRANSACTION_API =
            "https://online.mbbank.com.vn/api/retail-web-internetbankingms/get-account-transaction-history";

    /**
     * Lấy danh sách giao dịch thật từ MB Bank
     */
    public List<Map<String, Object>> getRecentTransactions() {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", mbBankConfig.getAuthorization());
            headers.set("Cookie", mbBankConfig.getCookie());
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                    "accountNo", mbBankConfig.getAccountNo(),
                    "fromDate", LocalDateTime.now().minusDays(1).toLocalDate().toString(),
                    "toDate", LocalDateTime.now().toLocalDate().toString(),
                    "pageIndex", 1,
                    "pageSize", 50
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    MB_TRANSACTION_API,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null || responseBody.get("transactionHistoryList") == null) {
                throw new RuntimeException("Empty response or no transaction list from MB");
            }

            return (List<Map<String, Object>>) responseBody.get("transactionHistoryList");
        } catch (Exception e) {
            log.error("[MBBank ERROR] {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch MB transaction history: " + e.getMessage());
        }
    }

    /**
     * Kiểm tra xem có giao dịch nào khớp với nội dung và số tiền không
     */
    public boolean verifyPayment(String description, int amount) {
        try {
            List<Map<String, Object>> transactions = getRecentTransactions();
            for (Map<String, Object> tx : transactions) {
                String info = String.valueOf(tx.get("description")).toLowerCase();
                int money = ((Number) tx.get("creditAmount")).intValue();

                if (money == amount && info.contains(description.toLowerCase())) {
                    log.info("[MBBank VERIFY] ✅ Found matched transaction: {}", info);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            log.error("[MBBank VERIFY ERROR] {}", e.getMessage(), e);
            return false;
        }
    }
}
