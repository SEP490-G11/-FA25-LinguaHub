package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.response.CourseDetailResponse;
import edu.lms.dto.response.CourseResponse;
import edu.lms.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lombok.AccessLevel.PRIVATE;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class CourseController {

    CourseService courseService;

    // Public: Xem tất cả course Approved
    @Operation(summary = "Public: Get all Approved courses")
    @GetMapping("/public/approved")
    public ApiRespond<List<CourseResponse>> getAllApprovedPublic() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRespond.<List<CourseResponse>>builder()
                .result(courseService.getAllApproved(email))
                .build();
    }

    // Public: Xem course Approved theo một tutor cụ thể
    @Operation(summary = "Public: Get Approved courses by tutor")
    @GetMapping("/public/approved/{tutorID}")
    public ApiRespond<List<CourseResponse>> getApprovedByTutorPublic(@PathVariable Long tutorID) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRespond.<List<CourseResponse>>builder()
                .result(courseService.getApprovedByTutor(tutorID, email))
                .build();
    }

    // Public: xem chi tiết một course (ai cũng xem được)
    @Operation(summary = "Public: Get course detail by ID")
    @GetMapping("/detail/{courseID}")
    public ApiRespond<CourseDetailResponse> getCourseById(@PathVariable Long courseID) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiRespond.<CourseDetailResponse>builder()
                .result(courseService.getCourseById(courseID, email))
                .build();
    }
}
