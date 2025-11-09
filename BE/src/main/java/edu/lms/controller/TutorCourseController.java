// src/main/java/edu/lms/controller/TutorCourseController.java
package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.TutorCourseRequest;
import edu.lms.dto.response.TutorCourseDetailResponse;
import edu.lms.dto.response.TutorCourseResponse;
import edu.lms.dto.response.TutorCourseStudentResponse;
import edu.lms.entity.Tutor;
import edu.lms.enums.CourseStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.TutorRepository;
import edu.lms.service.TutorCourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tutor/courses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Tutor Courses", description = "API quản lý khóa học do Tutor tạo")
public class TutorCourseController {

    TutorCourseService tutorCourseService;
    TutorRepository tutorRepository;

    // Create (tutor từ token)
    @Operation(summary = "Tutor tạo khóa học mới (Draft) - lấy tutor từ token")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiRespond<TutorCourseResponse> createForMe(
            @AuthenticationPrincipal(expression = "claims['sub']") String email,
            @RequestBody @Valid TutorCourseRequest request
    ) {
        return ApiRespond.<TutorCourseResponse>builder()
                .result(tutorCourseService.createCourseForCurrentTutor(email, request))
                .build();
    }

    // Read (tutor tự xem)
    @Operation(summary = "Tutor xem danh sách khóa học của chính mình (tất cả status)")
    @GetMapping("/me")
    public ApiRespond<List<TutorCourseResponse>> getMyCourses(
            @AuthenticationPrincipal(expression = "claims['sub']") String email
    ) {
        return ApiRespond.<List<TutorCourseResponse>>builder()
                .result(tutorCourseService.getMyCourses(email))
                .build();
    }

    @Operation(summary = "Tutor xem khóa học của chính mình theo status")
    @GetMapping("/me/by-status")
    public ApiRespond<List<TutorCourseResponse>> getMyCoursesByStatus(
            @AuthenticationPrincipal(expression = "claims['sub']") String email,
            @RequestParam(required = false) CourseStatus status
    ) {
        return ApiRespond.<List<TutorCourseResponse>>builder()
                .result(tutorCourseService.getMyCoursesByStatus(email, status))
                .message(status != null
                        ? "Fetched my courses with status " + status
                        : "Fetched all my courses")
                .build();
    }

    // Update (tutor tự sửa, chỉ khi chưa có enrollment)
    @Operation(summary = "Tutor cập nhật course của chính mình (chỉ khi chưa có learner enroll)")
    @PutMapping("/{courseID}")
    public ApiRespond<TutorCourseResponse> updateMyCourse(
            @AuthenticationPrincipal(expression = "claims['sub']") String email,
            @PathVariable Long courseID,
            @RequestBody @Valid TutorCourseRequest request
    ) {
        return ApiRespond.<TutorCourseResponse>builder()
                .result(tutorCourseService.updateCourseForCurrentTutor(email, courseID, request))
                .build();
    }

    // Delete (tutor tự xoá, chỉ khi Draft) – xoá Resource→Lesson→Section→Course
    @Operation(summary = "Tutor xóa course của chính mình (chỉ khi status = Draft). Sẽ xóa LessonResource → Lesson → Section → Course")
    @DeleteMapping("/{courseID}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMyCourse(
            @AuthenticationPrincipal(expression = "claims['sub']") String email,
            @PathVariable Long courseID
    ) {
        tutorCourseService.deleteCourseForCurrentTutor(email, courseID);
    }

    // GET USERS ENROLL OF COURSE
    @GetMapping("/courses/{courseID}/students")
    public ApiRespond<List<TutorCourseStudentResponse>> getStudentsByCourse(
            @PathVariable Long courseID,
            Authentication authentication) {

        String email = authentication.getName();
        Tutor tutor = tutorRepository.findByUser_Email(email)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        return ApiRespond.<List<TutorCourseStudentResponse>>builder()
                .result(tutorCourseService.getStudentsByCourse(courseID, tutor.getTutorID()))
                .build();
    }

    @Operation(summary = "Tutor xem chi tiết khóa học của chính mình (kèm Section/Lesson/Resource)")
    @GetMapping("/{courseID}")
    public ApiRespond<TutorCourseDetailResponse> getMyCourseDetail(
            @AuthenticationPrincipal(expression = "claims['sub']") String email,
            @PathVariable Long courseID
    ) {
        return ApiRespond.<TutorCourseDetailResponse>builder()
                .result(tutorCourseService.getMyCourseDetail(email, courseID))
                .build();
    }

    @Operation(summary = "Tutor gửi khóa học sang trạng thái Pending (submit for review)")
    @PutMapping("/{courseID}/submit")
    public ApiRespond<TutorCourseResponse> submitForReview(
            @AuthenticationPrincipal(expression = "claims['sub']") String email,
            @PathVariable Long courseID
    ) {
        return ApiRespond.<TutorCourseResponse>builder()
                .result(tutorCourseService.submitCourseForReview(email, courseID))
                .message("Course submitted for review (Pending)")
                .build();
    }

}
