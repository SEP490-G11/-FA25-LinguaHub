package edu.lms.scheduler;

import edu.lms.entity.Payment;
import edu.lms.enums.PaymentStatus;
import edu.lms.repository.PaymentRepository;
import edu.lms.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class PaymentScheduler {

    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;

    // Mỗi 2 phút kiểm tra tất cả payment đang pending
    @Scheduled(fixedDelay = 120000)
    public void autoCheckPendingPayments() {
        List<Payment> pending = paymentRepository.findAllByStatus(PaymentStatus.PENDING);
        for (Payment p : pending) {
            try {
                log.info("[AUTO CHECK] Checking payment ID {}", p.getPaymentID());
                paymentService.checkAndConfirmPayment(p.getPaymentID());
            } catch (Exception e) {
                log.warn("[AUTO CHECK ERROR] {}", e.getMessage());
            }
        }
    }
}
