package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.LessonRequest;
import edu.lms.dto.response.LessonResponse;
import edu.lms.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lombok.AccessLevel.PRIVATE;

@RestController
@RequestMapping("/tutor/courses/sections")
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class LessonController {

        LessonService lessonService;

        // GET LESSONS BY SECTION
        @GetMapping("/{sectionID}/lessons")
        public ApiRespond<List<LessonResponse>> getLessonsBySection(
                        @PathVariable Long sectionID,
                        @RequestParam(required = false) String sortBy,
                        @RequestParam(required = false, defaultValue = "ASC") String order,
                        @RequestParam(required = false) String keyword) {
                // Get tutorId from section
                Long tutorId = lessonService.getTutorIdBySection(sectionID);

                List<LessonResponse> lessons;
                if (keyword != null || sortBy != null) {
                        lessons = lessonService.getLessonsBySectionWithFilters(sectionID, tutorId, keyword, sortBy,
                                        order);
                } else {
                        lessons = lessonService.getLessonsBySection(sectionID, tutorId);
                }

                return ApiRespond.<List<LessonResponse>>builder()
                                .result(lessons)
                                .message("Lessons retrieved successfully")
                                .build();
        }

        // CREATE LESSON
        @PostMapping("/{sectionID}/lessons")
        public ApiRespond<LessonResponse> createLesson(
                        @PathVariable Long sectionID,
                        @RequestBody @Valid LessonRequest request) {
                Long tutorId = lessonService.getTutorIdBySection(sectionID);
                LessonResponse lesson = lessonService.createLesson(sectionID, request, tutorId);

                return ApiRespond.<LessonResponse>builder()
                                .result(lesson)
                                .message("Lesson created successfully")
                                .build();
        }

        // GET LESSON DETAIL
        @GetMapping("/lessons/{lessonId}")
        public ApiRespond<LessonResponse> getLessonDetail(
                        @PathVariable Long lessonId) {
                Long tutorId = lessonService.getTutorIdByLesson(lessonId);
                LessonResponse lesson = lessonService.getLessonDetail(lessonId, tutorId);

                return ApiRespond.<LessonResponse>builder()
                                .result(lesson)
                                .message("Lesson details retrieved successfully")
                                .build();
        }

        // UPDATE LESSON
        @PutMapping("/lessons/{lessonId}")
        public ApiRespond<LessonResponse> updateLesson(
                        @PathVariable Long lessonId,
                        @RequestBody @Valid LessonRequest request) {
                Long tutorId = lessonService.getTutorIdByLesson(lessonId);
                LessonResponse lesson = lessonService.updateLesson(lessonId, request, tutorId);

                return ApiRespond.<LessonResponse>builder()
                                .result(lesson)
                                .message("Lesson updated successfully")
                                .build();
        }

        // DELETE LESSON
        @DeleteMapping("/lessons/{lessonId}")
        public ApiRespond<Void> deleteLesson(
                        @PathVariable Long lessonId) {
                Long tutorId = lessonService.getTutorIdByLesson(lessonId);
                lessonService.deleteLesson(lessonId, tutorId);

                return ApiRespond.<Void>builder()
                                .message("Lesson deleted successfully")
                                .build();
        }
}
