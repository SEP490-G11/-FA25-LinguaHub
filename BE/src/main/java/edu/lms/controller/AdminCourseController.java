package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.response.AdminCourseResponse;
import edu.lms.enums.CourseStatus;
import edu.lms.service.AdminCourseService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lombok.AccessLevel.PRIVATE;

@RestController
@RequestMapping("/admin/courses")
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class AdminCourseController {

    AdminCourseService adminCourseService;

    @PreAuthorize("principal.claims['role'] == 'Admin'")
    @Operation(summary = "Admin: Get courses by status (Draft, Pending, Approved, Rejected, Disabled)")
    @GetMapping("/by-status")
    public ApiRespond<List<AdminCourseResponse>> getAllByStatus(
            @RequestParam(required = false) CourseStatus status
    ) {
        return ApiRespond.<List<AdminCourseResponse>>builder()
                .result(adminCourseService.getAllCoursesForAdmin(status))
                .message(status != null
                        ? "Fetched all courses (admin view) with status " + status
                        : "Fetched all courses (admin view)")
                .build();
    }
}
