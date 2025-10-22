package edu.lms.controller;

import edu.lms.dto.request.TutorApplyRequest;
import edu.lms.dto.response.TutorApplyResponse;
import edu.lms.dto.response.TutorApplicationDetailResponse;
import edu.lms.dto.response.TutorApplicationListResponse;
import edu.lms.service.TutorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/test/tutors")
@RequiredArgsConstructor
public class TutorTestController {

    private final TutorService tutorService;

    // Test submit application (bypass authentication)
    @PostMapping("/apply/{userId}")
    public ResponseEntity<?> testApplyToBecomeTutor(
            @PathVariable Long userId,
            @RequestBody TutorApplyRequest request
    ) {
        try {
            tutorService.applyToBecomeTutor(userId, request);
            return ResponseEntity.ok("Application submitted successfully for user ID: " + userId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(" Error: " + e.getMessage());
        }
    }

    // Test get application status
    @GetMapping("/status/{userId}")
    public ResponseEntity<?> testGetApplicationStatus(@PathVariable Long userId) {
        try {
            TutorApplyResponse response = tutorService.getApplicationStatus(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(" Error: " + e.getMessage());
        }
    }

    // Test get pending applications (admin)
    @GetMapping("/pending")
    public ResponseEntity<?> testGetPendingApplications() {
        try {
            List<TutorApplicationListResponse> applications = tutorService.getPendingApplications();
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(" Error: " + e.getMessage());
        }
    }

    // Test get application detail
    @GetMapping("/detail/{verificationId}")
    public ResponseEntity<?> testGetApplicationDetail(@PathVariable Long verificationId) {
        try {
            TutorApplicationDetailResponse detail = tutorService.getApplicationDetail(verificationId);
            return ResponseEntity.ok(detail);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(" Error: " + e.getMessage());
        }
    }

    // Test approve application
    @PostMapping("/approve/{verificationId}/{adminId}")
    public ResponseEntity<?> testApproveApplication(
            @PathVariable Long verificationId,
            @PathVariable Long adminId
    ) {
        try {
            tutorService.approveTutorApplication(verificationId, adminId);
            return ResponseEntity.ok(" Application approved successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(" Error: " + e.getMessage());
        }
    }

    // Test reject application
    @PostMapping("/reject/{verificationId}/{adminId}")
    public ResponseEntity<?> testRejectApplication(
            @PathVariable Long verificationId,
            @PathVariable Long adminId,
            @RequestParam(defaultValue = "Insufficient documentation") String reason
    ) {
        try {
            tutorService.rejectTutorApplication(verificationId, adminId, reason);
            return ResponseEntity.ok("Application rejected successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(" Error: " + e.getMessage());
        }
    }

    // Test get all tutors
    @GetMapping("/all")
    public ResponseEntity<?> testGetAllTutors(@RequestParam(required = false) String status) {
        try {
            List<TutorApplicationListResponse> tutors = tutorService.getAllTutors(status);
            return ResponseEntity.ok(tutors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(" Error: " + e.getMessage());
        }
    }
}

