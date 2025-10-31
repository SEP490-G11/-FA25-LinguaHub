package edu.lms.service;

import edu.lms.dto.request.PaymentRequest;
import edu.lms.entity.*;
import edu.lms.enums.EnrollmentStatus;
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

    // ==============================
    // 1️⃣ Tạo thanh toán
    // ==============================
    public ResponseEntity<?> createPayment(PaymentRequest request) {
        BigDecimal amount;
        String description;

        if (request.getPaymentType() == PaymentType.Course) {
            Course course = courseRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
            amount = course.getPrice();
            description = "Thanh toán khóa học: " + course.getTitle();
        } else if (request.getPaymentType() == PaymentType.Booking) {
            BookingPlan plan = bookingPlanRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
            amount = plan.getPricePerSlot();
            description = "Thanh toán gói học 1:1: " + plan.getTitle();
        } else {
            throw new AppException(ErrorCode.INVALID_PAYMENT_TYPE);
        }

        return payOSService.createPaymentLink(
                request.getUserId(),
                request.getPaymentType(),
                request.getTargetId(),
                amount,
                description
        );
    }

    // ==============================
    // 2️⃣ Hậu thanh toán (Webhook)
    // ==============================
    public void processPostPayment(Payment payment) {
        if (payment.getStatus() != PaymentStatus.PAID) return;

        payment.setIsPaid(true);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        Long userId = payment.getUserId();
        Long targetId = payment.getTargetId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        // ===== COURSE PAYMENT =====
        if (payment.getPaymentType() == PaymentType.Course) {
            Course course = courseRepository.findById(targetId)
                    .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

            // Nếu chưa có enrollment, tạo mới
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

            log.info("🎓 [COURSE PAYMENT] User {} enrolled in course '{}' successfully.",
                    user.getEmail(), course.getTitle());
        }

        // ===== BOOKING PAYMENT =====
        else if (payment.getPaymentType() == PaymentType.Booking) {
            BookingPlan plan = bookingPlanRepository.findById(targetId)
                    .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

            UserBookingPlan userBookingPlan = payment.getUserBookingPlan();
            if (userBookingPlan == null) {
                userBookingPlan = UserBookingPlan.builder()
                        .user(user)
                        .bookingPlan(plan)
                        .startDate(LocalDateTime.now())
                        .purchasedSlots(1)
                        .remainingSlots(1)
                        .isActive(true)
                        .build();

                userBookingPlanRepository.save(userBookingPlan);
                payment.setUserBookingPlan(userBookingPlan);
                paymentRepository.save(payment);
            }

            log.info("📅 [BOOKING PAYMENT] User {} activated booking plan '{}' successfully.",
                    user.getEmail(), plan.getTitle());
        }
    }
}
