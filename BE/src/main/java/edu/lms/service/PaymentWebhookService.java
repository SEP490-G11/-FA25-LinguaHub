package edu.lms.service;

import edu.lms.entity.Payment;
import edu.lms.enums.PaymentStatus;
import edu.lms.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentWebhookService {

    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;

    public void handleWebhook(String orderCode, String status, Map<String, Object> payload) {
        paymentRepository.findByOrderCode(orderCode).ifPresent(payment -> {
            switch (status.toUpperCase()) {
                case "PAID":
                case "SUCCESS":
                    payment.setStatus(PaymentStatus.PAID);
                    payment.setPaidAt(LocalDateTime.now());
                    payment.setIsPaid(true);
                    paymentRepository.save(payment);

                    paymentService.processPostPayment(payment);
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

            log.info("🔔 Webhook processed for orderCode={}, status={}", orderCode, status);
        });
    }
}
