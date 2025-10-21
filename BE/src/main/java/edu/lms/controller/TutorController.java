package edu.lms.controller;

import edu.lms.dto.request.TutorApplyRequest;
import edu.lms.dto.response.TutorApplyResponse;
import edu.lms.service.TutorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tutors")
@RequiredArgsConstructor
public class TutorController {

    private final TutorService tutorService;

    // 1. Submit application
    @PostMapping("/apply")
    public ResponseEntity<?> applyToBecomeTutor(
            @RequestHeader("X-User-Id") String userId, // Tạm lấy userId từ Header (sẽ thay bằng token sau)
            @RequestBody @Valid TutorApplyRequest request
    ) {
        tutorService.applyToBecomeTutor(userId, request);
        return ResponseEntity.ok("Application submitted successfully and is now pending review.");
    }

    // 2. View application status
    @GetMapping("/apply/status")
    public ResponseEntity<TutorApplyResponse> getApplyStatus(
            @RequestHeader("X-User-Id") String userId
    ) {
        return ResponseEntity.ok(tutorService.getApplicationStatus(userId));
    }
}
