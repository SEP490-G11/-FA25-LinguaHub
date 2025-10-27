package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.LessonResourceRequest;
import edu.lms.dto.response.LessonResourceResponse;
import edu.lms.service.LessonResourceService;
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
public class LessonResourceController {

    LessonResourceService lessonResourceService;

    // ADD RESOURCE
    @PostMapping("/lessons/{lessonId}/resources")
    public ApiRespond<LessonResourceResponse> addResource(
            @PathVariable Long lessonId,
            @RequestBody @Valid LessonResourceRequest request
    ) {
        Long tutorId = lessonResourceService.getTutorIdByLesson(lessonId);
        LessonResourceResponse resource = lessonResourceService.addResource(lessonId, request, tutorId);

        return ApiRespond.<LessonResourceResponse>builder()
                .result(resource)
                .message("Resource added successfully")
                .build();
    }

    // GET RESOURCES BY LESSON
    @GetMapping("/lessons/{lessonId}/resources")
    public ApiRespond<List<LessonResourceResponse>> getResourcesByLesson(
            @PathVariable Long lessonId
    ) {
        Long tutorId = lessonResourceService.getTutorIdByLesson(lessonId);
        List<LessonResourceResponse> resources = lessonResourceService.getResourcesByLesson(lessonId, tutorId);

        return ApiRespond.<List<LessonResourceResponse>>builder()
                .result(resources)
                .message("Resources retrieved successfully")
                .build();
    }

    // UPDATE RESOURCE
    @PutMapping("/resources/{resourceId}")
    public ApiRespond<LessonResourceResponse> updateResource(
            @PathVariable Long resourceId,
            @RequestBody @Valid LessonResourceRequest request
    ) {
        Long tutorId = lessonResourceService.getTutorIdByResource(resourceId);
        LessonResourceResponse resource = lessonResourceService.updateResource(resourceId, request, tutorId);

        return ApiRespond.<LessonResourceResponse>builder()
                .result(resource)
                .message("Resource updated successfully")
                .build();
    }

    // DELETE RESOURCE
    @DeleteMapping("/resources/{resourceId}")
    public ApiRespond<Void> deleteResource(
            @PathVariable Long resourceId
    ) {
        Long tutorId = lessonResourceService.getTutorIdByResource(resourceId);
        lessonResourceService.deleteResource(resourceId, tutorId);

        return ApiRespond.<Void>builder()
                .message("Resource deleted successfully")
                .build();
    }
}
