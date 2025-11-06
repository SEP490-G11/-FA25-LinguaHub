package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.TutorBookingPlanRequest;
import edu.lms.dto.response.BookingPlanSlotResponse;
import edu.lms.dto.response.TutorBookingPlanResponse;
import edu.lms.entity.Tutor;
import edu.lms.enums.SlotStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.TutorRepository;
import edu.lms.security.UserPrincipal;
import edu.lms.service.TutorBookingPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/tutors/booking-plans")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Tutor Booking Plan", description = "API quản lý booking plan cho tutor")
public class TutorBookingPlanController {

    TutorBookingPlanService tutorBookingPlanService;
    TutorRepository tutorRepository;

    @Operation(summary = "Tutor tạo booking plan mới (1 ngày trong tuần) - Lấy tutorID từ authentication")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiRespond<TutorBookingPlanResponse> create(@RequestBody @Valid TutorBookingPlanRequest request) {
        // Lấy tutorID từ authentication để đảm bảo security
        Long currentTutorID = getCurrentTutorID();
        
        // Validate tutorID trong request phải match với tutor đang đăng nhập
        if (!request.getTutorID().equals(currentTutorID)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        return ApiRespond.<TutorBookingPlanResponse>builder()
                .result(tutorBookingPlanService.createBookingPlan(request))
                .message("Booking plan created successfully")
                .build();
    }

    @Operation(summary = "Tutor xem booking plans của chính mình (lấy tutorID từ authentication)")
    @GetMapping("/my-plans")
    public ApiRespond<List<TutorBookingPlanResponse>> getMyBookingPlans() {
        Long currentTutorID = getCurrentTutorID();
        return ApiRespond.<List<TutorBookingPlanResponse>>builder()
                .result(tutorBookingPlanService.getBookingPlansByTutor(currentTutorID))
                .message("Booking plans retrieved successfully")
                .build();
    }

    @Operation(summary = "Lấy danh sách booking plan của 1 tutor (Admin hoặc để xem tutor khác)")
    @GetMapping("/tutor/{tutorID}")
    public ApiRespond<List<TutorBookingPlanResponse>> getByTutor(@PathVariable Long tutorID) {
        // Validate: Tutor chỉ có thể xem booking plans của chính mình
        Long currentTutorID = getCurrentTutorID();
        if (!tutorID.equals(currentTutorID)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        return ApiRespond.<List<TutorBookingPlanResponse>>builder()
                .result(tutorBookingPlanService.getBookingPlansByTutor(tutorID))
                .message("Booking plans retrieved successfully")
                .build();
    }

    @Operation(summary = "Lấy tất cả booking plan trong hệ thống")
    @GetMapping
    public ApiRespond<List<TutorBookingPlanResponse>> getAll() {
        return ApiRespond.<List<TutorBookingPlanResponse>>builder()
                .result(tutorBookingPlanService.getAllBookingPlans())
                .message("All booking plans retrieved successfully")
                .build();
    }

    @Operation(summary = "Lấy chi tiết booking plan theo ID")
    @GetMapping("/{id}")
    public ApiRespond<TutorBookingPlanResponse> getById(@PathVariable Long id) {
        return ApiRespond.<TutorBookingPlanResponse>builder()
                .result(tutorBookingPlanService.getBookingPlanById(id))
                .message("Booking plan details retrieved successfully")
                .build();
    }

    // ==================== SLOTS ENDPOINTS ====================

    @Operation(summary = "Tutor xem tất cả slots của chính mình (lấy tutorID từ authentication)")
    @GetMapping("/my-slots")
    public ApiRespond<List<BookingPlanSlotResponse>> getMySlots() {
        Long currentTutorID = getCurrentTutorID();
        return ApiRespond.<List<BookingPlanSlotResponse>>builder()
                .result(tutorBookingPlanService.getSlotsByTutor(currentTutorID))
                .message("Slots retrieved successfully")
                .build();
    }

    @Operation(summary = "Lấy tất cả slots của tutor (Admin hoặc để xem tutor khác)")
    @GetMapping("/tutor/{tutorID}/slots")
    public ApiRespond<List<BookingPlanSlotResponse>> getSlotsByTutor(@PathVariable Long tutorID) {
        // Validate: Tutor chỉ có thể xem slots của chính mình
        Long currentTutorID = getCurrentTutorID();
        if (!tutorID.equals(currentTutorID)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        return ApiRespond.<List<BookingPlanSlotResponse>>builder()
                .result(tutorBookingPlanService.getSlotsByTutor(tutorID))
                .message("Slots retrieved successfully")
                .build();
    }

    @Operation(summary = "Tutor xem slots của booking plan của chính mình")
    @GetMapping("/my-booking-plan/{bookingPlanID}/slots")
    public ApiRespond<List<BookingPlanSlotResponse>> getMySlotsByBookingPlan(
            @PathVariable Long bookingPlanID) {
        Long currentTutorID = getCurrentTutorID();
        return ApiRespond.<List<BookingPlanSlotResponse>>builder()
                .result(tutorBookingPlanService.getSlotsByBookingPlan(currentTutorID, bookingPlanID))
                .message("Slots retrieved successfully")
                .build();
    }

    @Operation(summary = "Lấy slots của tutor theo booking plan (Admin hoặc để xem tutor khác)")
    @GetMapping("/tutor/{tutorID}/booking-plan/{bookingPlanID}/slots")
    public ApiRespond<List<BookingPlanSlotResponse>> getSlotsByBookingPlan(
            @PathVariable Long tutorID,
            @PathVariable Long bookingPlanID) {
        // Validate: Tutor chỉ có thể xem slots của chính mình
        Long currentTutorID = getCurrentTutorID();
        if (!tutorID.equals(currentTutorID)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        return ApiRespond.<List<BookingPlanSlotResponse>>builder()
                .result(tutorBookingPlanService.getSlotsByBookingPlan(tutorID, bookingPlanID))
                .message("Slots retrieved successfully")
                .build();
    }

    @Operation(summary = "Tutor xem slots theo status của chính mình")
    @GetMapping("/my-slots/status/{status}")
    public ApiRespond<List<BookingPlanSlotResponse>> getMySlotsByStatus(
            @PathVariable SlotStatus status) {
        Long currentTutorID = getCurrentTutorID();
        return ApiRespond.<List<BookingPlanSlotResponse>>builder()
                .result(tutorBookingPlanService.getSlotsByStatus(currentTutorID, status))
                .message("Slots retrieved successfully")
                .build();
    }

    @Operation(summary = "Lấy slots của tutor theo status (Admin hoặc để xem tutor khác)")
    @GetMapping("/tutor/{tutorID}/slots/status/{status}")
    public ApiRespond<List<BookingPlanSlotResponse>> getSlotsByStatus(
            @PathVariable Long tutorID,
            @PathVariable SlotStatus status) {
        // Validate: Tutor chỉ có thể xem slots của chính mình
        Long currentTutorID = getCurrentTutorID();
        if (!tutorID.equals(currentTutorID)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        return ApiRespond.<List<BookingPlanSlotResponse>>builder()
                .result(tutorBookingPlanService.getSlotsByStatus(tutorID, status))
                .message("Slots retrieved successfully")
                .build();
    }

    @Operation(summary = "Tutor xem slots đã được book của chính mình")
    @GetMapping("/my-slots/booked")
    public ApiRespond<List<BookingPlanSlotResponse>> getMyBookedSlots() {
        Long currentTutorID = getCurrentTutorID();
        return ApiRespond.<List<BookingPlanSlotResponse>>builder()
                .result(tutorBookingPlanService.getBookedSlots(currentTutorID))
                .message("Booked slots retrieved successfully")
                .build();
    }

    @Operation(summary = "Lấy slots đã được book của tutor (Admin hoặc để xem tutor khác)")
    @GetMapping("/tutor/{tutorID}/slots/booked")
    public ApiRespond<List<BookingPlanSlotResponse>> getBookedSlots(@PathVariable Long tutorID) {
        // Validate: Tutor chỉ có thể xem slots của chính mình
        Long currentTutorID = getCurrentTutorID();
        if (!tutorID.equals(currentTutorID)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        return ApiRespond.<List<BookingPlanSlotResponse>>builder()
                .result(tutorBookingPlanService.getBookedSlots(tutorID))
                .message("Booked slots retrieved successfully")
                .build();
    }

    @Operation(summary = "Tutor xem slots còn trống của chính mình")
    @GetMapping("/my-slots/available")
    public ApiRespond<List<BookingPlanSlotResponse>> getMyAvailableSlots() {
        Long currentTutorID = getCurrentTutorID();
        return ApiRespond.<List<BookingPlanSlotResponse>>builder()
                .result(tutorBookingPlanService.getAvailableSlots(currentTutorID))
                .message("Available slots retrieved successfully")
                .build();
    }

    @Operation(summary = "Lấy slots còn trống (chưa được book) của tutor (Admin hoặc để xem tutor khác)")
    @GetMapping("/tutor/{tutorID}/slots/available")
    public ApiRespond<List<BookingPlanSlotResponse>> getAvailableSlots(@PathVariable Long tutorID) {
        // Validate: Tutor chỉ có thể xem slots của chính mình
        Long currentTutorID = getCurrentTutorID();
        if (!tutorID.equals(currentTutorID)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        return ApiRespond.<List<BookingPlanSlotResponse>>builder()
                .result(tutorBookingPlanService.getAvailableSlots(tutorID))
                .message("Available slots retrieved successfully")
                .build();
    }

    @Operation(summary = "Tutor xem slots trong khoảng thời gian của chính mình")
    @GetMapping("/my-slots/date-range")
    public ApiRespond<List<BookingPlanSlotResponse>> getMySlotsByDateRange(
            @RequestParam String startDate, // Format: yyyy-MM-ddTHH:mm:ss
            @RequestParam String endDate) { // Format: yyyy-MM-ddTHH:mm:ss
        Long currentTutorID = getCurrentTutorID();
        return ApiRespond.<List<BookingPlanSlotResponse>>builder()
                .result(tutorBookingPlanService.getSlotsByDateRange(
                        currentTutorID,
                        LocalDateTime.parse(startDate),
                        LocalDateTime.parse(endDate)))
                .message("Slots retrieved successfully")
                .build();
    }

    @Operation(summary = "Lấy slots của tutor trong khoảng thời gian (Admin hoặc để xem tutor khác)")
    @GetMapping("/tutor/{tutorID}/slots/date-range")
    public ApiRespond<List<BookingPlanSlotResponse>> getSlotsByDateRange(
            @PathVariable Long tutorID,
            @RequestParam String startDate, // Format: yyyy-MM-ddTHH:mm:ss
            @RequestParam String endDate) { // Format: yyyy-MM-ddTHH:mm:ss
        // Validate: Tutor chỉ có thể xem slots của chính mình
        Long currentTutorID = getCurrentTutorID();
        if (!tutorID.equals(currentTutorID)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        return ApiRespond.<List<BookingPlanSlotResponse>>builder()
                .result(tutorBookingPlanService.getSlotsByDateRange(
                        tutorID,
                        LocalDateTime.parse(startDate),
                        LocalDateTime.parse(endDate)))
                .message("Slots retrieved successfully")
                .build();
    }

    /**
     * Helper method to get current tutor ID from authentication
     */
    private Long getCurrentTutorID() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userID = userPrincipal.getUserId();
        
        Tutor tutor = tutorRepository.findByUser_UserID(userID)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));
        
        return tutor.getTutorID();
    }
}
