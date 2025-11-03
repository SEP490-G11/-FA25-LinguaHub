package edu.lms.service;

import edu.lms.dto.request.PaymentRequest;
import edu.lms.entity.*;
import edu.lms.enums.EnrollmentStatus;
import edu.lms.enums.PaymentMethod;
import edu.lms.enums.PaymentStatus;
import edu.lms.enums.PaymentType;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final CourseRepository courseRepository;
    private final BookingPlanRepository bookingPlanRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserBookingPlanRepository userBookingPlanRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PayOSService payOSService;

    // ======================================================
    // 1. TẠO THANH TOÁN (PENDING)
    // ======================================================
    public ResponseEntity<?> createPayment(PaymentRequest request) {
        BigDecimal amount;
        String description;

        // ---------------------------
        // COURSE PAYMENT
        // ---------------------------
        if (request.getPaymentType() == PaymentType.Course) {
            Course course = courseRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

            amount = course.getPrice();
            description = "Thanh toán khóa học: " + course.getTitle();

            Payment payment = Payment.builder()
                    .userId(request.getUserId())
                    .targetId(course.getCourseID())
                    .paymentType(PaymentType.Course)
                    .paymentMethod(PaymentMethod.PAYOS)
                    .status(PaymentStatus.PENDING)
                    .amount(amount)
                    .isPaid(false)
                    .build();

            paymentRepository.save(payment);

            // Gọi sang PayOS để tạo link thanh toán
            ResponseEntity<?> response = payOSService.createPaymentLink(
                    request.getUserId(),
                    request.getPaymentType(),
                    request.getTargetId(),
                    amount,
                    description
            );

            // Cập nhật các trường trả về từ PayOS vào DB
            updatePaymentWithPayOSResponse(payment, response);

            return response;
        }

        // ---------------------------
        // BOOKING PAYMENT
        // ---------------------------
        else if (request.getPaymentType() == PaymentType.Booking) {
            BookingPlan plan = bookingPlanRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

            int purchasedSlots = request.getPurchasedSlots() != null ? request.getPurchasedSlots() : 1;

            // Kiểm tra slot khả dụng
            if (plan.getAvailableSlots() < purchasedSlots) {
                throw new AppException(ErrorCode.BOOKING_SLOT_NOT_AVAILABLE);
            }

            // Tính tổng tiền
            amount = plan.getPricePerSlot().multiply(BigDecimal.valueOf(purchasedSlots));
            description = "Thanh toán gói học 1:1: " + plan.getTitle();

            // Cập nhật lại slot còn lại của plan
            plan.setAvailableSlots(plan.getAvailableSlots() - purchasedSlots);
            bookingPlanRepository.save(plan);

            // Lấy thông tin user
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

            // Tạo user booking plan (chưa active)
            UserBookingPlan userBookingPlan = UserBookingPlan.builder()
                    .user(user)
                    .bookingPlan(plan)
                    .purchasedSlots(purchasedSlots)
                    .remainingSlots(purchasedSlots)
                    .isActive(false)
                    .build();

            userBookingPlanRepository.save(userBookingPlan);

            // Lưu payment (PENDING)
            Payment payment = Payment.builder()
                    .userId(user.getUserID())
                    .targetId(plan.getBookingPlanID())
                    .paymentType(PaymentType.Booking)
                    .paymentMethod(PaymentMethod.PAYOS)
                    .status(PaymentStatus.PENDING)
                    .amount(amount)
                    .userBookingPlan(userBookingPlan)
                    .isPaid(false)
                    .build();

            paymentRepository.save(payment);

            // Gọi PayOS để tạo link
            ResponseEntity<?> response = payOSService.createPaymentLink(
                    request.getUserId(),
                    request.getPaymentType(),
                    request.getTargetId(),
                    amount,
                    description
            );

            // Cập nhật lại các trường từ PayOS
            updatePaymentWithPayOSResponse(payment, response);

            return response;
        }

        // ---------------------------
        // INVALID TYPE
        // ---------------------------
        else {
            throw new AppException(ErrorCode.INVALID_PAYMENT_TYPE);
        }
    }

    // ======================================================
    // 2. HẬU THANH TOÁN (PAYMENT SUCCESS)
    // ======================================================
    public void processPostPayment(Payment payment) {
        if (payment.getStatus() != PaymentStatus.PAID) return;

        payment.setIsPaid(true);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        Long userId = payment.getUserId();
        Long targetId = payment.getTargetId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        // COURSE PAYMENT
        if (payment.getPaymentType() == PaymentType.Course) {
            Course course = courseRepository.findById(targetId)
                    .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

            Enrollment enrollment = payment.getEnrollment();
            if (enrollment == null) {
                enrollment = Enrollment.builder()
                        .user(user)
                        .course(course)
                        .status(EnrollmentStatus.Active)
                        .createdAt(LocalDateTime.now())
                        .build();

                enrollmentRepository.save(enrollment);
                payment.setEnrollment(enrollment);
                paymentRepository.save(payment);
            }

            log.info("[COURSE PAYMENT] User {} enrolled in course '{}'", user.getEmail(), course.getTitle());
        }

        // BOOKING PAYMENT
        else if (payment.getPaymentType() == PaymentType.Booking) {
            BookingPlan plan = bookingPlanRepository.findById(targetId)
                    .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

            UserBookingPlan userBookingPlan = payment.getUserBookingPlan();
            if (userBookingPlan != null) {
                userBookingPlan.setIsActive(true);
                userBookingPlan.setStartDate(LocalDateTime.now());
                userBookingPlanRepository.save(userBookingPlan);

                log.info("[BOOKING PAYMENT] User {} activated booking plan '{}'", user.getEmail(), plan.getTitle());
            }
        }
    }

    // ======================================================
    // 3. HÀM ROLLBACK (FAILED / CANCELLED / EXPIRED)
    // ======================================================
    public void rollbackBookingPayment(Payment payment) {
        if (payment.getPaymentType() != PaymentType.Booking) return;
        if (payment.getUserBookingPlan() == null) return;

        UserBookingPlan userBookingPlan = payment.getUserBookingPlan();
        BookingPlan plan = userBookingPlan.getBookingPlan();

        if (!userBookingPlan.getIsActive()) {
            plan.setAvailableSlots(plan.getAvailableSlots() + userBookingPlan.getPurchasedSlots());
            bookingPlanRepository.save(plan);

            userBookingPlanRepository.delete(userBookingPlan);

            payment.setStatus(PaymentStatus.CANCELLED);
            payment.setIsPaid(false);
            paymentRepository.save(payment);

            log.warn("[ROLLBACK] Payment {} cancelled, restored {} slots for plan '{}'",
                    payment.getOrderCode(), userBookingPlan.getPurchasedSlots(), plan.getTitle());
        }
    }

    // ======================================================
    // 4. HÀM CẬP NHẬT PAYMENT SAU KHI NHẬN LINK TỪ PAYOS
    // ======================================================
    @SuppressWarnings("unchecked")
    private void updatePaymentWithPayOSResponse(Payment payment, ResponseEntity<?> response) {
        try {
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
            if (responseBody != null) {
                String orderCode = (String) responseBody.get("orderCode");
                Map<String, Object> data = (Map<String, Object>) responseBody.get("data");

                payment.setOrderCode(orderCode);
                payment.setCheckoutUrl((String) data.get("checkoutUrl"));
                payment.setQrCodeUrl((String) data.get("qrCode"));
                payment.setPaymentLinkId((String) data.get("paymentLinkId"));

                paymentRepository.save(payment);
                log.info("[PAYMENT UPDATED] Payment {} updated with PayOS link data", payment.getPaymentID());
            }
        } catch (Exception e) {
            log.error("Failed to update payment info from PayOS response: {}", e.getMessage());
        }
    }
}
