package edu.lms.controller;

import edu.lms.dto.request.PaymentRequest;
import edu.lms.service.PaymentService;
import edu.lms.service.PayOSService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PayOSService payOSService;

    //API tạo thanh toán
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequest request) {
        return paymentService.createPayment(request);
    }
}
