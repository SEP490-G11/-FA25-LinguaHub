package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.TutorServiceRequest;
import edu.lms.dto.response.TutorServiceResponse;
import edu.lms.service.TutorServiceManager;
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
@RequestMapping("/tutor/services")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Tutor Services", description = "API quản lý dịch vụ (service) 1:1 của Tutor")
public class TutorServiceController {

    TutorServiceManager tutorServiceManager;

    @Operation(summary = "Tutor tạo service mới")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiRespond<TutorServiceResponse> create(@RequestBody @Valid TutorServiceRequest request) {
        return ApiRespond.<TutorServiceResponse>builder()
                .result(tutorServiceManager.createService(request))
                .build();
    }

    @Operation(summary = "Lấy danh sách tất cả service của 1 tutor")
    @GetMapping("/{tutorID}")
    public ApiRespond<List<TutorServiceResponse>> getByTutor(@PathVariable Long tutorID) {
        return ApiRespond.<List<TutorServiceResponse>>builder()
                .result(tutorServiceManager.getServicesByTutor(tutorID))
                .build();
    }

    @Operation(summary = "Lấy danh sách tất cả service trong hệ thống")
    @GetMapping("/all")
    public ApiRespond<List<TutorServiceResponse>> getAll() {
        return ApiRespond.<List<TutorServiceResponse>>builder()
                .result(tutorServiceManager.getAllServices())
                .build();
    }

    @Operation(summary = "Lấy chi tiết 1 service theo ID")
    @GetMapping("/detail/{id}")
    public ApiRespond<TutorServiceResponse> getById(@PathVariable Long id) {
        return ApiRespond.<TutorServiceResponse>builder()
                .result(tutorServiceManager.getServiceById(id))
                .build();
    }

    @Operation(summary = "Cập nhật service theo ID")
    @PutMapping("/{id}")
    public ApiRespond<TutorServiceResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid TutorServiceRequest request) {
        return ApiRespond.<TutorServiceResponse>builder()
                .result(tutorServiceManager.updateService(id, request))
                .build();
    }

    @Operation(summary = "Xóa service (chỉ khi chưa có user mua)")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        tutorServiceManager.deleteService(id);
    }
}
