package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.LessonRequest;
import edu.lms.dto.response.LessonResponse;
import edu.lms.security.UserPrincipal;
import edu.lms.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/tutors")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    // View all lessons in a section
    @GetMapping("/coursesections/{coursesectionId}/lessons")
    @PreAuthorize("hasAuthority('MANAGE_LESSON')")
    public ResponseEntity<ApiRespond<List<LessonResponse>>> getLessonsBySection(
            @PathVariable Long coursesectionId,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "ASC") String order,
            @RequestParam(required = false) String keyword
    ) {
        Long tutorId = getCurrentTutorId();
        List<LessonResponse> lessons;

        if (keyword != null || sortBy != null) {
            lessons = lessonService.getLessonsBySectionWithFilters(coursesectionId, tutorId, keyword, sortBy, order);
        } else {
            lessons = lessonService.getLessonsBySection(coursesectionId, tutorId);
        }

        return ResponseEntity.ok(ApiRespond.<List<LessonResponse>>builder()
                .result(lessons)
                .message("Lessons retrieved successfully")
                .build());
    }

    // Create a new lesson
    @PostMapping("/coursesections/{coursesectionId}/lessons")
    @PreAuthorize("hasAuthority('MANAGE_LESSON')")
    public ResponseEntity<ApiRespond<LessonResponse>> createLesson(
            @PathVariable Long coursesectionId,
            @RequestBody @Valid LessonRequest request
    ) {
        Long tutorId = getCurrentTutorId();
        LessonResponse lesson = lessonService.createLesson(coursesectionId, request, tutorId);

        return ResponseEntity.ok(ApiRespond.<LessonResponse>builder()
                .result(lesson)
                .message("Lesson created successfully")
                .build());
    }

    // View lesson detail
    @GetMapping("/lessons/{lessonId}")
    @PreAuthorize("hasAuthority('MANAGE_LESSON')")
    public ResponseEntity<ApiRespond<LessonResponse>> getLessonDetail(
            @PathVariable Long lessonId
    ) {
        Long tutorId = getCurrentTutorId();
        LessonResponse lesson = lessonService.getLessonDetail(lessonId, tutorId);

        return ResponseEntity.ok(ApiRespond.<LessonResponse>builder()
                .result(lesson)
                .message("Lesson details retrieved successfully")
                .build());
    }

    // Update lesson
    @PutMapping("/lessons/{lessonId}")
    @PreAuthorize("hasAuthority('MANAGE_LESSON')")
    public ResponseEntity<ApiRespond<LessonResponse>> updateLesson(
            @PathVariable Long lessonId,
            @RequestBody @Valid LessonRequest request
    ) {
        Long tutorId = getCurrentTutorId();
        LessonResponse lesson = lessonService.updateLesson(lessonId, request, tutorId);

        return ResponseEntity.ok(ApiRespond.<LessonResponse>builder()
                .result(lesson)
                .message("Lesson updated successfully")
                .build());
    }

    // Delete lesson
    @DeleteMapping("/lessons/{lessonId}")
    @PreAuthorize("hasAuthority('MANAGE_LESSON')")
    public ResponseEntity<ApiRespond<Void>> deleteLesson(
            @PathVariable Long lessonId
    ) {
        Long tutorId = getCurrentTutorId();
        lessonService.deleteLesson(lessonId, tutorId);

        return ResponseEntity.ok(ApiRespond.<Void>builder()
                .message("Lesson deleted successfully")
                .build());
    }

    // Helper method to get current tutor ID from JWT token
    private Long getCurrentTutorId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            // Assuming tutorId is stored in UserPrincipal or can be derived from userId
            return userPrincipal.getUserId(); // You might need to modify this based on your UserPrincipal structure
        }
        throw new RuntimeException("User not authenticated");
    }
}
