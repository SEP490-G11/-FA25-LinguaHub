//package edu.lms.service;
//
//import edu.lms.entity.Payment;
//import edu.lms.enums.PaymentStatus;
//import edu.lms.repository.PaymentRepository;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Service;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Map;
//
//@Slf4j
//@Service
//@RequiredArgsConstructor
//public class BankStatementChecker {
//
//    private final PaymentRepository paymentRepository;
//    private final PaymentService paymentService;
//    private final BankApiService bankApiService; // gọi API sao kê ngân hàng
//
//    /**
//     * Cron job chạy mỗi 1 phút để kiểm tra giao dịch mới
//     */
//    @Scheduled(fixedDelay = 60000)
//    public void autoCheckPayments() {
//        log.info("[AUTO CHECK] Starting VietQR payment reconciliation...");
//
//        // Lấy các payment đang chờ thanh toán
//        List<Payment> pendingPayments = paymentRepository.findAllByStatus(PaymentStatus.PENDING);
//        if (pendingPayments.isEmpty()) return;
//
//        // Lấy danh sách giao dịch mới trong tài khoản
//        List<Map<String, Object>> transactions = bankApiService.getRecentTransactions();
//
//        for (Payment payment : pendingPayments) {
//            transactions.stream()
//                    .filter(tx -> {
//                        String desc = String.valueOf(tx.get("description")).toUpperCase();
//                        return desc.contains(payment.getOrderCode());
//                    })
//                    .findFirst()
//                    .ifPresent(match -> {
//                        BigDecimal amount = new BigDecimal(match.get("amount").toString());
//                        if (amount.compareTo(payment.getAmount()) >= 0) {
//                            payment.setStatus(PaymentStatus.PAID);
//                            payment.setIsPaid(true);
//                            payment.setPaidAt(LocalDateTime.now());
//                            paymentRepository.save(payment);
//                            paymentService.processPostPayment(payment);
//
//                            log.info("[AUTO CHECK] ✅ Payment {} matched with bank txn {}", payment.getPaymentID(), match);
//                        }
//                    });
//        }
//    }
//}
