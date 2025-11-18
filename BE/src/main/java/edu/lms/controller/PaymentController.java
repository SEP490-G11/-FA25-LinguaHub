package edu.lms.controller;

import edu.lms.dto.request.PaymentRequest;
import edu.lms.dto.response.PaymentResponse;
import edu.lms.entity.Payment;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.PaymentRepository;
import edu.lms.service.PaymentService;
import edu.lms.service.PayOSService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@Tag(name = "Payment Management", description = "Endpoints for creating and managing payments (Admin / Tutor / Learner)")
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PayOSService payOSService;
    private final PaymentRepository paymentRepository;

    // ======================================================
    // CREATE PAYMENT
    // ======================================================
    @Operation(summary = "Create a payment (PayOS)", description = "Create a pending payment link via PayOS")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Payment link created successfully",
                    content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "400", description = "Invalid payment request", content = @Content)
    })
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequest request) {
        return paymentService.createPayment(request);
    }

    // ======================================================
    // GET PAYMENTS CHO USER ĐANG LOGIN (/me)
    // ======================================================
    @GetMapping("/me")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(
            @AuthenticationPrincipal(expression = "claims['userId']") Long userId,
            @AuthenticationPrincipal(expression = "claims['role']") String role
    ) {
        List<PaymentResponse> payments = paymentService.getPaymentsForMe(userId, role);
        return ResponseEntity.ok(payments);
    }

    // ======================================================
    // ADMIN - GET ALL PAYMENTS
    // ======================================================
    @GetMapping("/admin")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        List<PaymentResponse> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    // ======================================================
    // TUTOR - GET PAYMENTS BY TUTOR ID (cho admin / thống kê)
    // ======================================================
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByTutor(@PathVariable Long tutorId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByTutor(tutorId);
        return ResponseEntity.ok(payments);
    }

    // ======================================================
    // USER - GET PAYMENTS BY USER ID (cho admin)
    // ======================================================
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByUser(@PathVariable Long userId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByUser(userId);
        return ResponseEntity.ok(payments);
    }

    // ======================================================
    // HEALTH CHECK
    // ======================================================
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return new ResponseEntity<>("Payment service is running ✅", HttpStatus.OK);
    }

    // ======================================================
    // CALLBACK: CANCEL (PayOS → Backend → FE)
    // ======================================================
    @GetMapping("/cancel")
    public void cancelPayment(
            @RequestParam("paymentId") Long paymentId,
            HttpServletResponse response
    ) throws IOException {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        Long targetId = payment.getTargetId();
        response.sendRedirect("http://localhost:3000/course/" + targetId);
    }

    // ======================================================
    // CALLBACK: SUCCESS (PayOS → Backend → FE)
    // ======================================================
    @GetMapping("/success")
    public void successPayment(
            @RequestParam("paymentId") Long paymentId,
            HttpServletResponse response
    ) throws IOException {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        Long targetId = payment.getTargetId();
        response.sendRedirect("http://localhost:3000/course/" + targetId + "?paid=true");
    }
}
