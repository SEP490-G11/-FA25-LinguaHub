package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.TutorBookingPlanRequest;
import edu.lms.dto.response.TutorBookingPlanResponse;
import edu.lms.service.TutorBookingPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tutors/booking-plans")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Tutor Booking Plan", description = "API quản lý gói học 1:1 (Booking Plan)")
public class TutorBookingPlanController {

    TutorBookingPlanService tutorBookingPlanService;

    // CREATE
    @Operation(summary = "Tutor tạo booking plan mới")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiRespond<TutorBookingPlanResponse> create(@RequestBody @Valid TutorBookingPlanRequest request) {
        return ApiRespond.<TutorBookingPlanResponse>builder()
                .result(tutorBookingPlanService.createBookingPlan(request))
                .build();
    }

    // GET BY TUTOR
    @Operation(summary = "Lấy danh sách tất cả booking plan của 1 tutor")
    @GetMapping("/tutor/{tutorID}")
    public ApiRespond<List<TutorBookingPlanResponse>> getByTutor(@PathVariable Long tutorID) {
        return ApiRespond.<List<TutorBookingPlanResponse>>builder()
                .result(tutorBookingPlanService.getBookingPlansByTutor(tutorID))
                .build();
    }

    // GET ALL (Admin view / global)
    @Operation(summary = "Lấy danh sách tất cả booking plan trong hệ thống")
    @GetMapping
    public ApiRespond<List<TutorBookingPlanResponse>> getAll() {
        return ApiRespond.<List<TutorBookingPlanResponse>>builder()
                .result(tutorBookingPlanService.getAllBookingPlans())
                .build();
    }

    // GET DETAIL BY ID
    @Operation(summary = "Lấy chi tiết 1 booking plan theo ID")
    @GetMapping("/{id}")
    public ApiRespond<TutorBookingPlanResponse> getById(@PathVariable Long id) {
        return ApiRespond.<TutorBookingPlanResponse>builder()
                .result(tutorBookingPlanService.getBookingPlanById(id))
                .build();
    }

    // UPDATE
    @Operation(summary = "Cập nhật thông tin booking plan theo ID")
    @PutMapping("/{id}")
    public ApiRespond<TutorBookingPlanResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid TutorBookingPlanRequest request) {
        return ApiRespond.<TutorBookingPlanResponse>builder()
                .result(tutorBookingPlanService.updateBookingPlan(id, request))
                .build();
    }

    // DELETE
    @Operation(summary = "Xóa booking plan (chỉ khi chưa có user mua)")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        tutorBookingPlanService.deleteBookingPlan(id);
    }
}
