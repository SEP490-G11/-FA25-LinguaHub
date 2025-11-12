package edu.lms.service;

import edu.lms.dto.request.PaymentRequest;
import edu.lms.dto.request.SlotRequest;
import edu.lms.dto.response.PaymentResponse;
import edu.lms.entity.*;
import edu.lms.enums.*;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.mapper.PaymentMapper;
import edu.lms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.type.CheckoutResponseData;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final CourseRepository courseRepository;
    private final BookingPlanRepository bookingPlanRepository;
    private final BookingPlanSlotRepository bookingPlanSlotRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PayOSService payOSService;
    private final ChatService chatService;
    private final PaymentMapper paymentMapper;

    // ======================================================
    // TẠO THANH TOÁN (PENDING)
    // ======================================================
    @Transactional
    public ResponseEntity<?> createPayment(PaymentRequest request) {
        Payment payment;
        BigDecimal amount;
        String description;
        Long tutorId;

        // ----------------- COURSE PAYMENT -----------------
        if (request.getPaymentType() == PaymentType.Course) {
            Course course = courseRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

            amount = course.getPrice();
            tutorId = course.getTutor().getTutorID();
            description = "Course: " + course.getTitle();

            payment = Payment.builder()
                    .userId(request.getUserId())
                    .targetId(course.getCourseID())
                    .tutorId(tutorId)
                    .paymentType(PaymentType.Course)
                    .paymentMethod(PaymentMethod.PAYOS)
                    .status(PaymentStatus.PENDING)
                    .amount(amount)
                    .isPaid(false)
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .build();
            paymentRepository.save(payment);
        }

        // ----------------- BOOKING PAYMENT -----------------
        else if (request.getPaymentType() == PaymentType.Booking) {
            BookingPlan plan = bookingPlanRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

            tutorId = plan.getTutorID();
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

            List<SlotRequest> slots = request.getSlots();
            if (slots == null || slots.isEmpty()) {
                throw new AppException(ErrorCode.BOOKING_SLOT_NOT_AVAILABLE);
            }

            // 💰 Tính tổng tiền
            BigDecimal totalAmount = BigDecimal.valueOf(plan.getPricePerHours() * slots.size());
            description = "Slot 1:1 " + plan.getTitle();

            // 🕒 Khóa slot tạm
            for (SlotRequest s : slots) {
                boolean taken = bookingPlanSlotRepository.existsByTutorIDAndStartTimeAndEndTime(
                        plan.getTutorID(), s.getStartTime(), s.getEndTime());
                if (taken) throw new AppException(ErrorCode.BOOKING_SLOT_NOT_AVAILABLE);

                BookingPlanSlot slot = BookingPlanSlot.builder()
                        .bookingPlanID(plan.getBookingPlanID())
                        .tutorID(plan.getTutorID())
                        .userID(user.getUserID())
                        .startTime(s.getStartTime())
                        .endTime(s.getEndTime())
                        .status(SlotStatus.Locked)
                        .lockedAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusMinutes(15))
                        .build();
                bookingPlanSlotRepository.save(slot);
            }

            payment = Payment.builder()
                    .userId(user.getUserID())
                    .tutorId(tutorId)
                    .targetId(plan.getBookingPlanID())
                    .paymentType(PaymentType.Booking)
                    .paymentMethod(PaymentMethod.PAYOS)
                    .status(PaymentStatus.PENDING)
                    .amount(totalAmount)
                    .isPaid(false)
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .build();
            paymentRepository.save(payment);

            bookingPlanSlotRepository.updatePaymentForUserLockedSlots(
                    user.getUserID(), plan.getTutorID(), payment.getPaymentID()
            );

            amount = totalAmount;
        } else {
            throw new AppException(ErrorCode.INVALID_PAYMENT_TYPE);
        }

        // ----------------- GỌI PAYOS -----------------
        CheckoutResponseData data = payOSService.createPaymentLink(
                request.getUserId(),
                request.getPaymentType(),
                request.getTargetId(),
                amount,
                description
        );

        // ----------------- CẬP NHẬT PAYMENT -----------------
        updatePaymentWithPayOSData(payment, data);
        return ResponseEntity.ok(Map.of(
                "checkoutUrl", data.getCheckoutUrl(),
                "expiresAt", payment.getExpiresAt()));
    }

    // ======================================================
    // HẬU THANH TOÁN (PAYMENT SUCCESS)
    // ======================================================
    @Transactional
    public void processPostPayment(Payment payment) {
        if (payment.getStatus() != PaymentStatus.PAID) return;

        payment.setIsPaid(true);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        Long userId = payment.getUserId();
        Long targetId = payment.getTargetId();

        // COURSE PAYMENT
        if (payment.getPaymentType() == PaymentType.Course) {
            Course course = courseRepository.findById(targetId)
                    .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

            Enrollment enrollment = Enrollment.builder()
                    .user(user)
                    .course(course)
                    .status(EnrollmentStatus.Active)
                    .createdAt(LocalDateTime.now())
                    .build();

            enrollmentRepository.save(enrollment);
            payment.setEnrollment(enrollment);
            payment.setTutorId(course.getTutor().getTutorID());
            paymentRepository.save(payment);

            log.info("[COURSE PAYMENT] User {} enrolled in course '{}'", userId, course.getTitle());
        }

        // BOOKING PAYMENT
        else if (payment.getPaymentType() == PaymentType.Booking) {
            List<BookingPlanSlot> slots = bookingPlanSlotRepository.findAllByPaymentID(payment.getPaymentID());
            for (BookingPlanSlot s : slots) {
                s.setStatus(SlotStatus.Paid);
                bookingPlanSlotRepository.save(s);
            }

            if (!slots.isEmpty()) {
                Long tutorID = slots.get(0).getTutorID();
                payment.setTutorId(tutorID);
                paymentRepository.save(payment);

                try {
                    chatService.ensureTrainingRoomExists(userId, tutorID);
                    log.info("[CHAT ROOM] Created for User {} & Tutor {}", userId, tutorID);
                } catch (Exception e) {
                    log.warn("[CHAT ROOM] Failed to ensure room: {}", e.getMessage());
                }
            }

            log.info("[BOOKING PLAN PAID] User {} confirmed {} slots as PAID", userId, slots.size());
        }
    }


    // ======================================================
    // LẤY PAYMENT (ADMIN / TUTOR / USER)
    // ======================================================
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByTutor(Long tutorId) {
        return paymentRepository.findAllByTutorId(tutorId)
                .stream().map(paymentMapper::toPaymentResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByUser(Long userId) {
        return paymentRepository.findAllByUserId(userId)
                .stream().map(paymentMapper::toPaymentResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream().map(paymentMapper::toPaymentResponse).toList();
    }

    // ======================================================
    // CẬP NHẬT PAYMENT SAU KHI NHẬN LINK PAYOS
    // ======================================================
    private void updatePaymentWithPayOSData(Payment payment, CheckoutResponseData data) {
        try {
            if (data == null) return;

            payment.setOrderCode(String.valueOf(data.getOrderCode()));
            payment.setCheckoutUrl(data.getCheckoutUrl());
            payment.setQrCodeUrl(data.getQrCode());
            payment.setPaymentLinkId(data.getPaymentLinkId());
            paymentRepository.save(payment);

            log.info("[PAYMENT UPDATED] Payment {} updated with PayOS link data", payment.getPaymentID());
        } catch (Exception e) {
            log.error("Failed to update payment info from PayOS: {}", e.getMessage());
        }
    }
}
