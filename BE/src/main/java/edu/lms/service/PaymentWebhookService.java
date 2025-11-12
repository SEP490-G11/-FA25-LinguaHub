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
     * Handle webhook callback from PayOS
     */
    public void handleWebhook(String orderCode, String status, Map<String, Object> payload) {
        log.info("Handling webhook | orderCode={} | status={} | payload={}", orderCode, status, payload);

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
                        newStatus = PaymentStatus.PAID;
                        payment.setStatus(newStatus);
                        payment.setPaidAt(LocalDateTime.now());
                        payment.setIsPaid(true);

                        log.info("Payment {} marked as PAID at {}", orderCode, payment.getPaidAt());
                        paymentService.processPostPayment(payment);
                        break;
                    case "SUCCESS":
                        // 🕒 Kiểm tra hết hạn trước khi xử lý
                        if (payment.getExpiresAt() != null && LocalDateTime.now().isAfter(payment.getExpiresAt())) {
                            log.warn("Payment {} arrived AFTER expiration ({} > {}) → ignoring webhook",
                                    payment.getOrderCode(), LocalDateTime.now(), payment.getExpiresAt());

                            payment.setStatus(PaymentStatus.EXPIRED);
                            payment.setIsPaid(false);
                            paymentRepository.save(payment);
                            return;
                        }

                        //Nếu chưa hết hạn thì xử lý như bình thường
                        newStatus = PaymentStatus.PAID;
                        payment.setStatus(newStatus);
                        payment.setPaidAt(LocalDateTime.now());
                        payment.setIsPaid(true);

                        log.info("Payment {} marked as PAID at {}", orderCode, payment.getPaidAt());
                        paymentService.processPostPayment(payment);
                        break;

                    case "FAILED":
                        newStatus = PaymentStatus.valueOf(upperStatus);
                        handlePaymentRollback(payment, upperStatus);
                        break;
                    case "CANCELLED":
                        newStatus = PaymentStatus.valueOf(upperStatus);
                        handlePaymentRollback(payment, upperStatus);
                        break;
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
                log.error("Error while processing webhook for orderCode={}: {}", orderCode, e.getMessage(), e);
            }
        }, () -> {
            log.warn("Payment not found in database for orderCode={}", orderCode);
        });
    }

    /**
     * Rollback payment-related data when payment failed or cancelled.
     */
    public void handlePaymentRollback(Payment payment, String reason) {
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
