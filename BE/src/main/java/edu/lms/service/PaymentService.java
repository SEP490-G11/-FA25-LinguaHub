package edu.lms.service;

import edu.lms.configuration.VietQRConfig;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final VietQRConfig vietQRConfig;
    private final CourseRepository courseRepository;
    private final BookingPlanRepository bookingPlanRepository;
    private final BookingPlanSlotRepository bookingPlanSlotRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final ChatService chatService;
    private final PaymentMapper paymentMapper;
    private final VietQRService vietQRService;
    private final MBBankService mbBankService;

    // ======================================================
    // 🔹 TẠO THANH TOÁN (COURSE / BOOKING)
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
            description = "COURSE-" + course.getCourseID() + "-" + System.currentTimeMillis() / 1000;

            payment = Payment.builder()
                    .userId(request.getUserId())
                    .targetId(course.getCourseID())
                    .tutorId(tutorId)
                    .paymentType(PaymentType.Course)
                    .paymentMethod(PaymentMethod.BANK)
                    .status(PaymentStatus.PENDING)
                    .description(description)
                    .amount(amount)
                    .isPaid(false)
                    .expiresAt(LocalDateTime.now().plusHours(1))
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

            BigDecimal totalAmount = BigDecimal.valueOf(plan.getPricePerHours() * slots.size());
            description = "BOOK-" + plan.getBookingPlanID() + "-" + System.currentTimeMillis() / 1000;

            // 🕒 Khóa slot tạm thời
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
                        .expiresAt(LocalDateTime.now().plusHours(1))
                        .build();
                bookingPlanSlotRepository.save(slot);
            }

            payment = Payment.builder()
                    .userId(user.getUserID())
                    .tutorId(tutorId)
                    .targetId(plan.getBookingPlanID())
                    .paymentType(PaymentType.Booking)
                    .paymentMethod(PaymentMethod.BANK)
                    .status(PaymentStatus.PENDING)
                    .description(description)
                    .amount(totalAmount)
                    .isPaid(false)
                    .expiresAt(LocalDateTime.now().plusHours(1))
                    .build();

            paymentRepository.save(payment);

            bookingPlanSlotRepository.updatePaymentForUserLockedSlots(
                    user.getUserID(), plan.getTutorID(), payment.getPaymentID()
            );

            amount = totalAmount;
        } else {
            throw new AppException(ErrorCode.INVALID_PAYMENT_TYPE);
        }

        // ----------------- TẠO QR THANH TOÁN -----------------
        String qrImageUrl = vietQRService.generateQR(
                vietQRConfig.getBankCode(),
                vietQRConfig.getAccountNo(),
                vietQRConfig.getAccountName(),
                amount.intValue(),
                payment.getDescription()
        );

        return ResponseEntity.ok(Map.of(
                "paymentId", payment.getPaymentID(),
                "qrImage", qrImageUrl,
                "description", payment.getDescription(),
                "amount", amount,
                "accountNo", vietQRConfig.getAccountNo(),
                "accountName", vietQRConfig.getAccountName(),
                "bankCode", vietQRConfig.getBankCode(),
                "expiresAt", payment.getExpiresAt()
        ));
    }

    // ======================================================
    // 🔹 KIỂM TRA & XÁC NHẬN THANH TOÁN MB BANK
    // ======================================================
    @Transactional
    public ResponseEntity<?> checkAndConfirmPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        boolean verified = mbBankService.verifyPayment(
                payment.getDescription(), payment.getAmount().intValue()
        );

        if (!verified) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "FAILED", "message", "Chưa thấy giao dịch trong MB Bank."));
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setIsPaid(true);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        processPostPayment(payment);

        return ResponseEntity.ok(Map.of(
                "status", "PAID",
                "message", "✅ Thanh toán xác nhận thành công!",
                "paymentId", paymentId
        ));
    }

    // ======================================================
    // 🔹 SAU KHI THANH TOÁN (COURSE / BOOKING)
    // ======================================================
    @Transactional
    public void processPostPayment(Payment payment) {
        if (payment.getStatus() != PaymentStatus.PAID) return;

        Long userId = payment.getUserId();
        Long targetId = payment.getTargetId();

        // ----------------- COURSE -----------------
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

        // ----------------- BOOKING -----------------
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

            log.info("[BOOKING PAID] User {} confirmed {} slots as PAID", userId, slots.size());
        }
    }

    // ======================================================
    // 🔹 LẤY PAYMENT (ADMIN / TUTOR / USER)
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
}
