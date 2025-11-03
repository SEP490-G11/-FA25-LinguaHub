package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.TutorCourseRequest;
import edu.lms.dto.response.TutorCourseResponse;
import edu.lms.dto.response.TutorCourseStudentResponse;
import edu.lms.service.TutorCourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tutor/courses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Tutor Courses", description = "API quản lý khóa học do Tutor tạo")
public class TutorCourseController {

    TutorCourseService tutorCourseService;

    // CREATE COURSE
    @Operation(summary = "Tutor tạo khóa học mới (Draft)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiRespond<TutorCourseResponse> create(@RequestBody @Valid TutorCourseRequest request) {
        return ApiRespond.<TutorCourseResponse>builder()
                .result(tutorCourseService.createCourse(request))
                .build();
    }

    // GET COURSES BY TUTOR ID
    @Operation(summary = "Lấy danh sách khóa học của Tutor theo ID")
    @GetMapping("/{tutorID}")
    public ApiRespond<List<TutorCourseResponse>> getCoursesByTutor(@PathVariable Long tutorID) {
        return ApiRespond.<List<TutorCourseResponse>>builder()
                .result(tutorCourseService.getCoursesByTutorID(tutorID))
                .build();
    }

    // GET ALL COURSES
    @Operation(summary = "Lấy danh sách tất cả khóa học (Admin/Public)")

    @GetMapping("/all")
    @PreAuthorize("permitAll()")
    public ApiRespond<List<TutorCourseResponse>> getAllCourses() {
        return ApiRespond.<List<TutorCourseResponse>>builder()
                .result(tutorCourseService.getAllCourses())
                .build();
    }

    // GET COURSE BY ID
    @Operation(summary = "Lấy chi tiết khóa học theo CourseID")
    @GetMapping("/detail/{courseID}")
    public ApiRespond<TutorCourseResponse> getCourseById(@PathVariable Long courseID) {
        return ApiRespond.<TutorCourseResponse>builder()
                .result(tutorCourseService.getCourseById(courseID))
                .build();
    }

    // UPDATE COURSE BY ID
    @Operation(summary = "Cập nhật khóa học theo CourseID (chỉ khi chưa có learner enroll)")
    @PutMapping("/{courseID}")
    public ApiRespond<TutorCourseResponse> updateCourse(
            @PathVariable Long courseID,
            @RequestBody @Valid TutorCourseRequest request) {
        return ApiRespond.<TutorCourseResponse>builder()
                .result(tutorCourseService.updateCourse(courseID, request))
                .build();
    }

    // DELETE COURSE BY ID
    @Operation(summary = "Xóa khóa học theo CourseID (chỉ khi chưa có learner enroll)")
    @DeleteMapping("/{courseID}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCourse(@PathVariable Long courseID) {
        tutorCourseService.deleteCourse(courseID);
    }

    // GET USERS ENROLL OF COURSE
    @Operation(summary = "Tutor xem danh sách học viên theo courseID")
    @GetMapping("/{tutorID}/{courseID}/students")
    public ApiRespond<List<TutorCourseStudentResponse>> getStudentsByCourse(
            @PathVariable Long tutorID,
            @PathVariable Long courseID) {

        return ApiRespond.<List<TutorCourseStudentResponse>>builder()
                .result(tutorCourseService.getStudentsByCourse(courseID, tutorID))
                .build();
    }

}
