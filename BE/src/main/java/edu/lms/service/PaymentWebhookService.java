package edu.lms.service;

import edu.lms.entity.BookingPlan;
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

    public void handleWebhook(String orderCode, String status, Map<String, Object> payload) {
        paymentRepository.findByOrderCode(orderCode).ifPresent(payment -> {
            PaymentStatus newStatus;

            switch (status.toUpperCase()) {
                case "PAID":
                case "SUCCESS":
                    newStatus = PaymentStatus.PAID;
                    payment.setStatus(newStatus);
                    payment.setPaidAt(LocalDateTime.now());
                    payment.setIsPaid(true);
                    paymentService.processPostPayment(payment);
                    break;

                case "FAILED":
                case "CANCELLED":
                case "EXPIRED":
                    newStatus = PaymentStatus.valueOf(status.toUpperCase());
                    handlePaymentRollback(payment, status.toUpperCase());
                    break;

                default:
                    newStatus = PaymentStatus.PENDING;
            }

            payment.setTransactionResponse(payload.toString());
            paymentRepository.save(payment);

            log.info("Webhook processed for orderCode={}, status={}", orderCode, newStatus);
        });
    }

    private void handlePaymentRollback(Payment payment, String reason) {
        if (payment.getPaymentType() != PaymentType.Booking) return;

        // Lấy danh sách slot liên quan tới PaymentID
        List<BookingPlanSlot> slots = bookingPlanSlotRepository.findAllByPaymentID(payment.getPaymentID());
        if (slots.isEmpty()) return;

        // Xử lý rollback: chỉ xóa các slot Locked chưa thanh toán
        for (BookingPlanSlot slot : slots) {
            if (slot.getStatus() == SlotStatus.Locked) {
                bookingPlanSlotRepository.delete(slot);
                log.warn("[ROLLBACK] Xóa slot {} ({} - {}) do thanh toán {}",
                        slot.getSlotID(), slot.getStartTime(), slot.getEndTime(), reason);
            }
        }

        // Cập nhật trạng thái payment
        payment.setStatus(PaymentStatus.valueOf(reason));
        payment.setIsPaid(false);
        paymentRepository.save(payment);

        log.warn("[ROLLBACK] Payment {} marked as {}. {} slot(s) removed.",
                payment.getOrderCode(), reason, slots.size());
    }

}
