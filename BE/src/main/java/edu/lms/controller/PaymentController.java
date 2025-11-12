package edu.lms.controller;

import edu.lms.dto.request.PaymentRequest;
import edu.lms.dto.response.PaymentResponse;
import edu.lms.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Payment Management", description = "Endpoints for creating and managing payments (Admin / Tutor / Learner)")
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // ======================================================
    // 🔹 TẠO THANH TOÁN VIETQR
    // ======================================================
    @Operation(summary = "Create a VietQR payment",
            description = "Generate a VietQR code for MB Bank transfer (no merchant required)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "VietQR generated successfully",
                    content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "400", description = "Invalid request or VietQR error", content = @Content)
    })
    @PostMapping("/vietqr/create")
    public ResponseEntity<?> createVietQRPayment(@RequestBody PaymentRequest request) {
        try {
            return paymentService.createPayment(request);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to generate VietQR: " + e.getMessage());
        }
    }

    // ======================================================
    // 🔹 XÁC NHẬN THANH TOÁN TỪ MB BANK (REAL)
    // ======================================================
    @Operation(summary = "Check & confirm payment from MB Bank",
            description = "Admin or system verifies if the payment transaction is found in MB Bank account")
    @PostMapping("/check/{paymentId}")
    public ResponseEntity<?> checkAndConfirmPayment(@PathVariable Long paymentId) {
        return paymentService.checkAndConfirmPayment(paymentId);
    }

    // ======================================================
    // 🔹 ADMIN: XEM TẤT CẢ PAYMENT
    // ======================================================
    @Operation(summary = "Get all payments (Admin)", description = "Admin can view all payments in the system")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all payments",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PaymentResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping("/admin")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // ======================================================
    // 🔹 TUTOR: XEM PAYMENT LIÊN QUAN
    // ======================================================
    @Operation(summary = "Get payments by tutor", description = "Tutor can view all course and booking payments associated with them")
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByTutor(@PathVariable Long tutorId) {
        return ResponseEntity.ok(paymentService.getPaymentsByTutor(tutorId));
    }

    // ======================================================
    // 🔹 LEARNER: XEM LỊCH SỬ GIAO DỊCH
    // ======================================================
    @Operation(summary = "Get payments by user", description = "Learner can view their payment history")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getPaymentsByUser(userId));
    }

    // ======================================================
    // 🔹 HEALTH CHECK
    // ======================================================
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return new ResponseEntity<>("Payment service is running ✅", HttpStatus.OK);
    }
}
