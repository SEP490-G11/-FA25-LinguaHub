package edu.lms.service;

import edu.lms.entity.BookingPlan;
import edu.lms.entity.Payment;
import edu.lms.entity.UserBookingPlan;
import edu.lms.enums.PaymentStatus;
import edu.lms.repository.BookingPlanRepository;
import edu.lms.repository.PaymentRepository;
import edu.lms.repository.UserBookingPlanRepository;
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
    private final BookingPlanRepository bookingPlanRepository;
    private final UserBookingPlanRepository userBookingPlanRepository;
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
        if (payment.getPaymentType() == null || payment.getUserBookingPlan() == null) return;

        UserBookingPlan userBookingPlan = payment.getUserBookingPlan();
        BookingPlan plan = userBookingPlan.getBookingPlan();

        if (!userBookingPlan.getIsActive()) {
            plan.setAvailableSlots(plan.getAvailableSlots() + userBookingPlan.getPurchasedSlots());
            bookingPlanRepository.save(plan);

            userBookingPlanRepository.delete(userBookingPlan);

            payment.setStatus(PaymentStatus.valueOf(reason));
            payment.setIsPaid(false);
            paymentRepository.save(payment);

            log.warn("[ROLLBACK] Payment {} marked as {}, restored {} slots to plan '{}'",
                    payment.getOrderCode(), reason, userBookingPlan.getPurchasedSlots(), plan.getTitle());
        }
    }
}
