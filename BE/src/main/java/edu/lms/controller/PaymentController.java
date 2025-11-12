package edu.lms.controller;

import edu.lms.dto.request.PaymentRequest;
import edu.lms.dto.response.PaymentResponse;
import edu.lms.service.PaymentService;
import edu.lms.service.PayOSService;
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
    private final PayOSService payOSService;

    // ======================================================
    //API TẠO THANH TOÁN (ĐANG CHẠY ỔN)
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
    //ADMIN - XEM TẤT CẢ PAYMENT
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
        List<PaymentResponse> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    // ======================================================
    //TUTOR - XEM PAYMENT LIÊN QUAN TỚI MÌNH
    // ======================================================
    @Operation(summary = "Get payments by tutor", description = "Tutor can view all course and booking payments associated with them")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved tutor payments",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PaymentResponse.class))),
            @ApiResponse(responseCode = "404", description = "Tutor not found", content = @Content)
    })
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByTutor(@PathVariable Long tutorId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByTutor(tutorId);
        return ResponseEntity.ok(payments);
    }

    // ======================================================
    //LEARNER - XEM LỊCH SỬ GIAO DỊCH
    // ======================================================
    @Operation(summary = "Get payments by user", description = "Learner can view their payment history")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved user payments",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PaymentResponse.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByUser(@PathVariable Long userId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByUser(userId);
        return ResponseEntity.ok(payments);
    }

    // ======================================================
    // 5️⃣ HEALTH CHECK / TEST
    // ======================================================
    @Operation(summary = "Ping payment service", description = "Check if the payment service is running")
    @ApiResponse(responseCode = "200", description = "Service is alive")
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return new ResponseEntity<>("Payment service is running ✅", HttpStatus.OK);
    }
}
