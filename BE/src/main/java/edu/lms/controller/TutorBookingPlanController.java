package edu.lms.controller;

import edu.lms.dto.request.TutorBookingPlanRequest;
import edu.lms.dto.response.*;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.security.UserPrincipal;
import edu.lms.service.TutorBookingPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequiredArgsConstructor
@RequestMapping("/tutor")
public class TutorBookingPlanController {

    private final TutorBookingPlanService tutorBookingPlanService;

    /**
     * Tạo booking plan mới
     * Chỉ tutor đã được approve mới có thể tạo booking plan
     * Service layer sẽ kiểm tra tutor status = APPROVED
     */
    @PostMapping("/booking-plan")
    @PreAuthorize("principal.claims['role'] == 'Tutor'")
    public ResponseEntity<BookingPlanCreateResponse> createBookingPlan(
            @Valid @RequestBody TutorBookingPlanRequest request
    ) {
        Long currentUserId = getCurrentUserId();
        // Service layer sẽ kiểm tra tutor đã được approve và không bị suspended
        BookingPlanCreateResponse response = tutorBookingPlanService.createBookingPlan(currentUserId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Cập nhật booking plan
     * Chỉ tutor đã được approve và là owner của booking plan mới có thể cập nhật
     * Service layer sẽ kiểm tra:
     * - Tutor status = APPROVED
     * - Tutor là owner của booking plan
     * - Booking plan không có slots đang được sử dụng (Locked/Paid)
     */
    @PutMapping("/booking-plan/{bookingPlanId}")
    @PreAuthorize("principal.claims['role'] == 'Tutor'")
    public ResponseEntity<BookingPlanUpdateResponse> updateBookingPlan(
            @PathVariable Long bookingPlanId,
            @Valid @RequestBody TutorBookingPlanRequest request
    ) {
        Long currentUserId = getCurrentUserId();
        // Service layer sẽ kiểm tra tutor đã được approve, là owner, và booking plan chưa có slots booked
        BookingPlanUpdateResponse response = tutorBookingPlanService.updateBookingPlan(currentUserId, bookingPlanId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Xóa booking plan
     * Chỉ tutor đã được approve và là owner của booking plan mới có thể xóa
     * Service layer sẽ kiểm tra:
     * - Tutor status = APPROVED
     * - Tutor là owner của booking plan
     * - Booking plan không có slots đang được sử dụng (Locked/Paid)
     */
    @DeleteMapping("/booking-plan/{bookingPlanId}")
    @PreAuthorize("principal.claims['role'] == 'Tutor'")
    public ResponseEntity<OperationStatusResponse> deleteBookingPlan(@PathVariable Long bookingPlanId) {
        Long currentUserId = getCurrentUserId();
        // Service layer sẽ kiểm tra tutor đã được approve, là owner, và booking plan chưa có slots booked
        OperationStatusResponse response = tutorBookingPlanService.deleteBookingPlan(currentUserId, bookingPlanId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{tutorId}/booking-plan")
    @PreAuthorize("permitAll()")
    public ResponseEntity<BookingPlanListResponse> getBookingPlans(@PathVariable Long tutorId) {
        BookingPlanListResponse response = tutorBookingPlanService.getBookingPlansByTutor(tutorId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/booking-plan/{bookingPlanId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<BookingPlanDetailResponse> getBookingPlanDetail(@PathVariable Long bookingPlanId) {
        BookingPlanDetailResponse response = tutorBookingPlanService.getBookingPlanDetail(bookingPlanId);
        return ResponseEntity.ok(response);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // Kiểm tra authentication null trước
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        
        // Trường hợp 1: JWT token (OAuth2)
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            Object userId = jwt.getClaim("userId");
            
            if (userId == null) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
            
            if (userId instanceof Integer integerId) {
                return integerId.longValue();
            }
            if (userId instanceof Long longId) {
                return longId;
            }
            if (userId instanceof Number numberId) {
                return numberId.longValue();
            }
            
            // Nếu không tìm thấy userId trong JWT claim với format hợp lệ, throw exception
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        
        // Trường hợp 2: UserPrincipal (Form-based authentication)
        if (authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        
        // Nếu không phải Jwt hoặc UserPrincipal, throw exception
        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
}
