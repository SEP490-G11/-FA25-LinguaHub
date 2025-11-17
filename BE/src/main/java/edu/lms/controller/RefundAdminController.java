package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.service.RefundService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/refund")
@RequiredArgsConstructor
public class RefundAdminController {

    private final RefundService refundService;

    @PutMapping("/{id}/approve")
    public ApiRespond<Void> approve(@PathVariable Long id) {
        refundService.approve(id);
        return ApiRespond.<Void>builder()
                .message("Refund request approved successfully.")
                .build();
    }

    @PutMapping("/{id}/reject")
    public ApiRespond<Void> reject(@PathVariable Long id) {
        refundService.reject(id);
        return ApiRespond.<Void>builder()
                .message("Refund request rejected successfully.")
                .build();
    }
}
