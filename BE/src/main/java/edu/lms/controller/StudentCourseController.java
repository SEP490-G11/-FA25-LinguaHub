package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.response.StudentCourseResponse;
import edu.lms.entity.User;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.UserRepository;
import edu.lms.service.StudentCourseService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lombok.AccessLevel.PRIVATE;

@RestController
@RequestMapping("/student/courses")
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class StudentCourseController {

    StudentCourseService studentCourseService;
    UserRepository userRepository;

    @GetMapping
    public ApiRespond<List<StudentCourseResponse>> getCoursesByStudent(
            @AuthenticationPrincipal(expression = "claims['sub']") String email
    ) {
        // Tìm user theo email (vì JWT.sub = email)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        return ApiRespond.<List<StudentCourseResponse>>builder()
                .result(studentCourseService.getCoursesByStudent(user.getUserID()))
                .message("Fetched enrolled courses successfully")
                .build();
    }
}
