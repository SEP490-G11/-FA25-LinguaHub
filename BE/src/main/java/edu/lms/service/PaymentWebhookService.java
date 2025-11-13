package edu.lms.service;

import edu.lms.entity.BookingPlanSlot;
import edu.lms.entity.Payment;
import edu.lms.enums.PaymentStatus;
import edu.lms.enums.PaymentType;
import edu.lms.enums.SlotStatus;
import edu.lms.repository.BookingPlanSlotRepository;
import edu.lms.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentWebhookService {

    private final PaymentRepository paymentRepository;
    private final BookingPlanSlotRepository bookingPlanSlotRepository;
    private final PaymentService paymentService;

    /**
     * Handle webhook callback from PayOS using the old SDK:
     * code = "00" -> PAID
     * code != "00" -> FAILED
     */
    public void handleWebhook(String orderCode, String code, Map<String, Object> payload) {
        log.info("Handling webhook | orderCode={} | code={} | payload={}", orderCode, code, payload);

        paymentRepository.findByOrderCode(orderCode).ifPresentOrElse(payment -> {
            try {

                boolean isPaid = "00".equals(code);  // PayOS SUCCESS !

                if (isPaid) {
                    // -----------------------------
                    // 🔥 PAYMENT SUCCESS
                    // -----------------------------
                    payment.setStatus(PaymentStatus.PAID);
                    payment.setIsPaid(true);
                    payment.setPaidAt(LocalDateTime.now());

                    paymentRepository.save(payment);

                    log.info("[PAYOS] Payment {} marked as PAID", orderCode);

                    // Update slot after paid
                    paymentService.processPostPayment(payment);
                } else {
                    // -----------------------------
                    // ❌ PAYMENT FAILED / CANCELLED
                    // -----------------------------
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setIsPaid(false);

                    paymentRepository.save(payment);

                    log.warn("[PAYOS] Payment {} FAILED, rolling back slots...", orderCode);

                    handlePaymentRollback(payment, "FAILED");
                }

                // Save webhook response
                if (payload != null) {
                    payment.setTransactionResponse(payload.toString());
                }

                paymentRepository.save(payment);

            } catch (Exception e) {
                log.error("Webhook error for {}: {}", orderCode, e.getMessage(), e);
            }

        }, () -> log.warn("Payment not found for orderCode={}", orderCode));
    }

    /**
     * Rollback booking slot if payment failed/cancelled
     */
    public void handlePaymentRollback(Payment payment, String reason) {
        if (payment == null) return;

        if (payment.getPaymentType() != PaymentType.Booking) {
            paymentRepository.save(payment);
            return;
        }

        List<BookingPlanSlot> slots = bookingPlanSlotRepository.findAllByPaymentID(payment.getPaymentID());
        long deletedCount = 0;

        for (BookingPlanSlot slot : slots) {
            if (slot.getStatus() == SlotStatus.Locked) {
                bookingPlanSlotRepository.delete(slot);
                deletedCount++;

                log.warn("[ROLLBACK] Deleted slot {} ({} - {}) due to {}",
                        slot.getSlotID(), slot.getStartTime(), slot.getEndTime(), reason);
            }
        }

        log.warn("[ROLLBACK] Payment {} marked FAILED. Slots removed={}",
                payment.getOrderCode(), deletedCount);
    }
}
