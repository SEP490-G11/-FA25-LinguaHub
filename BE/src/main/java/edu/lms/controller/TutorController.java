package edu.lms.controller;

import edu.lms.dto.request.TutorApplyRequest;
import edu.lms.dto.response.TutorApplyResponse;
import edu.lms.security.UserPrincipal;
import edu.lms.service.TutorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tutors")
@RequiredArgsConstructor
public class TutorController {

    private final TutorService tutorService;

    // 1. Submit application
    @PostMapping("/apply")
    public ResponseEntity<?> applyToBecomeTutor(
            @RequestBody @Valid TutorApplyRequest request
    ) {
        Long userId = getCurrentUserId();
        tutorService.applyToBecomeTutor(userId, request);
        return ResponseEntity.ok("Application submitted successfully and is now pending review.");
    }

    // 2. View application status
    @GetMapping("/apply/status")
    public ResponseEntity<TutorApplyResponse> getApplyStatus() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(tutorService.getApplicationStatus(userId));
    }

    // Helper method to get current user ID from JWT token
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return ((UserPrincipal) authentication.getPrincipal()).getUserId();
        }
        throw new RuntimeException("User not authenticated");
    }
}
