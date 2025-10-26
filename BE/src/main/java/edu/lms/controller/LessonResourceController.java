package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.LessonResourceRequest;
import edu.lms.dto.response.LessonResourceResponse;
import edu.lms.security.UserPrincipal;
import edu.lms.service.LessonResourceService;
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
public class LessonResourceController {

    private final LessonResourceService lessonResourceService;

    // Add lesson resource
    @PostMapping("/lessons/{lessonId}/resources")
    @PreAuthorize("hasAuthority('MANAGE_LESSON')")
    public ResponseEntity<ApiRespond<LessonResourceResponse>> addResource(
            @PathVariable Long lessonId,
            @RequestBody @Valid LessonResourceRequest request
    ) {
        Long tutorId = getCurrentTutorId();
        LessonResourceResponse resource = lessonResourceService.addResource(lessonId, request, tutorId);

        return ResponseEntity.ok(ApiRespond.<LessonResourceResponse>builder()
                .result(resource)
                .message("Resource added successfully")
                .build());
    }

    // View lesson resources
    @GetMapping("/lessons/{lessonId}/resources")
    @PreAuthorize("hasAuthority('MANAGE_LESSON')")
    public ResponseEntity<ApiRespond<List<LessonResourceResponse>>> getResourcesByLesson(
            @PathVariable Long lessonId
    ) {
        Long tutorId = getCurrentTutorId();
        List<LessonResourceResponse> resources = lessonResourceService.getResourcesByLesson(lessonId, tutorId);

        return ResponseEntity.ok(ApiRespond.<List<LessonResourceResponse>>builder()
                .result(resources)
                .message("Resources retrieved successfully")
                .build());
    }

    // Update lesson resource
    @PutMapping("/resources/{resourceId}")
    @PreAuthorize("hasAuthority('MANAGE_LESSON')")
    public ResponseEntity<ApiRespond<LessonResourceResponse>> updateResource(
            @PathVariable Long resourceId,
            @RequestBody @Valid LessonResourceRequest request
    ) {
        Long tutorId = getCurrentTutorId();
        LessonResourceResponse resource = lessonResourceService.updateResource(resourceId, request, tutorId);

        return ResponseEntity.ok(ApiRespond.<LessonResourceResponse>builder()
                .result(resource)
                .message("Resource updated successfully")
                .build());
    }

    // Delete lesson resource
    @DeleteMapping("/resources/{resourceId}")
    @PreAuthorize("hasAuthority('MANAGE_LESSON')")
    public ResponseEntity<ApiRespond<Void>> deleteResource(
            @PathVariable Long resourceId
    ) {
        Long tutorId = getCurrentTutorId();
        lessonResourceService.deleteResource(resourceId, tutorId);

        return ResponseEntity.ok(ApiRespond.<Void>builder()
                .message("Resource deleted successfully")
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
