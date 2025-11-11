package edu.lms.service;

import edu.lms.entity.BookingPlanSlot;
import edu.lms.entity.Payment;
import edu.lms.enums.PaymentStatus;
import edu.lms.enums.PaymentType;
import edu.lms.enums.SlotStatus;
import edu.lms.repository.BookingPlanRepository;
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
    private final BookingPlanRepository bookingPlanRepository;
    private final BookingPlanSlotRepository bookingPlanSlotRepository;
    private final PaymentService paymentService;

    /**
     * Handle webhook callback from PayOS
     */
    public void handleWebhook(String orderCode, String status, Map<String, Object> payload) {
        log.info("🎯 Handling webhook | orderCode={} | status={} | payload={}", orderCode, status, payload);

        if (orderCode == null || status == null) {
            log.warn("Webhook received with null orderCode/status → skipping");
            return;
        }

        paymentRepository.findByOrderCode(orderCode).ifPresentOrElse(payment -> {
            try {
                PaymentStatus newStatus = PaymentStatus.PENDING;
                String upperStatus = status.toUpperCase();

                switch (upperStatus) {
                    case "PAID":
                    case "SUCCESS":
                        newStatus = PaymentStatus.PAID;
                        payment.setStatus(newStatus);
                        payment.setPaidAt(LocalDateTime.now());
                        payment.setIsPaid(true);

                        log.info("Payment {} marked as PAID at {}", orderCode, payment.getPaidAt());
                        paymentService.processPostPayment(payment);
                        break;

                    case "FAILED":
                    case "CANCELLED":
                    case "EXPIRED":
                        newStatus = PaymentStatus.valueOf(upperStatus);
                        handlePaymentRollback(payment, upperStatus);
                        break;

                    default:
                        log.info("Unrecognized status '{}' → keeping PENDING", status);
                        newStatus = PaymentStatus.PENDING;
                        payment.setIsPaid(false);
                }

                // Save response snapshot
                if (payload != null) {
                    payment.setTransactionResponse(payload.toString());
                }

                paymentRepository.save(payment);
                log.info("💾 Webhook processed successfully | orderCode={} | newStatus={}", orderCode, newStatus);

            } catch (Exception e) {
                log.error("🔥 Error while processing webhook for orderCode={}: {}", orderCode, e.getMessage(), e);
            }
        }, () -> {
            log.warn("Payment not found in database for orderCode={}", orderCode);
        });
    }

    /**
     * Rollback payment-related data when payment failed or cancelled.
     */
    private void handlePaymentRollback(Payment payment, String reason) {
        if (payment == null) return;

        if (payment.getPaymentType() != PaymentType.Booking) {
            log.info("Payment {} is not a Booking → skipping rollback", payment.getOrderCode());
            payment.setStatus(PaymentStatus.valueOf(reason));
            payment.setIsPaid(false);
            paymentRepository.save(payment);
            return;
        }

        // Lấy danh sách slot liên quan tới PaymentID
        List<BookingPlanSlot> slots = bookingPlanSlotRepository.findAllByPaymentID(payment.getPaymentID());
        if (slots.isEmpty()) {
            log.info("No locked slots to rollback for payment {}", payment.getOrderCode());
        }

        // Xử lý rollback: chỉ xóa các slot Locked chưa thanh toán
        long deletedCount = 0;
        for (BookingPlanSlot slot : slots) {
            if (slot.getStatus() == SlotStatus.Locked) {
                bookingPlanSlotRepository.delete(slot);
                deletedCount++;
                log.warn("[ROLLBACK] Deleted slot {} ({} - {}) due to payment {}",
                        slot.getSlotID(), slot.getStartTime(), slot.getEndTime(), reason);
            }
        }

        // Cập nhật trạng thái payment
        payment.setStatus(PaymentStatus.valueOf(reason));
        payment.setIsPaid(false);
        paymentRepository.save(payment);

        log.warn("[ROLLBACK] Payment {} marked as {}. {} slot(s) removed.",
                payment.getOrderCode(), reason, deletedCount);
    }
}
