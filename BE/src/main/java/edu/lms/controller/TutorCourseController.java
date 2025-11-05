package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.TutorCourseRequest;
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

    @Operation(summary = "Tutor xóa course của chính mình (chỉ khi status = Draft). Sẽ xóa Lesson → Section → Course")
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

        String email = authentication.getName(); // lấy email từ token
        Tutor tutor = tutorRepository.findByUser_Email(email)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        return ApiRespond.<List<TutorCourseStudentResponse>>builder()
                .result(tutorCourseService.getStudentsByCourse(courseID, tutor.getTutorID()))
                .build();
    }

    // PUBLIC (Learner/Guest)
    @Operation(summary = "Public: Xem tất cả course Approved")
    @GetMapping("/public/approved")
    public ApiRespond<List<TutorCourseResponse>> getAllApprovedPublic() {
        return ApiRespond.<List<TutorCourseResponse>>builder()
                .result(tutorCourseService.getAllCoursesByStatus(CourseStatus.Approved))
                .build();
    }

    @Operation(summary = "Public: Xem course Approved theo một tutor cụ thể")
    @GetMapping("/public/approved/{tutorID}")
    public ApiRespond<List<TutorCourseResponse>> getApprovedByTutorPublic(@PathVariable Long tutorID) {
        return ApiRespond.<List<TutorCourseResponse>>builder()
                .result(tutorCourseService.getCoursesByTutorAndStatus(tutorID, CourseStatus.Approved))
                .build();
    }

    // ADMIN/PUBLIC All by status

    @Operation(summary = "Admin lấy danh sách tất cả khóa học theo trạng thái (Draft, Pending, Approved, Rejected, Disabled)")
    @GetMapping("/all/by-status")
    public ApiRespond<List<TutorCourseResponse>> getAllCoursesByStatus(
            @RequestParam(required = false) CourseStatus status
    ) {
        return ApiRespond.<List<TutorCourseResponse>>builder()
                .result(tutorCourseService.getAllCoursesByStatus(status))
                .message(status != null
                        ? "Fetched all courses with status " + status
                        : "Fetched all courses (all statuses)")
                .build();
    }

    // OTHER

    @Operation(summary = "Lấy chi tiết khóa học theo CourseID")
    @GetMapping("/detail/{courseID}")
    public ApiRespond<TutorCourseResponse> getCourseById(@PathVariable Long courseID) {
        return ApiRespond.<TutorCourseResponse>builder()
                .result(tutorCourseService.getCourseById(courseID))
                .build();
    }

//    @Operation(summary = "Lấy danh sách khóa học của Tutor theo ID (legacy)")
//    @GetMapping("/{tutorID}")
//    public ApiRespond<List<TutorCourseResponse>> getCoursesByTutor(@PathVariable Long tutorID) {
//        return ApiRespond.<List<TutorCourseResponse>>builder()
//                .result(tutorCourseService.getCoursesByTutorID(tutorID))
//                .build();
//    }

    @Operation(summary = "Lấy danh sách tất cả khóa học (legacy)")
    @GetMapping("/all")
    public ApiRespond<List<TutorCourseResponse>> getAllCourses() {
        return ApiRespond.<List<TutorCourseResponse>>builder()
                .result(tutorCourseService.getAllCourses())
                .build();
    }



}
