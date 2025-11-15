package edu.lms.controller;

import edu.lms.dto.request.TutorPackageRequest;
import edu.lms.dto.response.OperationStatusResponse;
import edu.lms.dto.response.TutorPackageCreateResponse;
import edu.lms.dto.response.TutorPackageListResponse;
import edu.lms.dto.response.TutorPackageResponse;
import edu.lms.security.UserPrincipal;
import edu.lms.service.TutorPackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tutor")
@RequiredArgsConstructor
public class TutorPackageController {

    private final TutorPackageService tutorPackageService;

    @PostMapping("/package")
    public ResponseEntity<TutorPackageCreateResponse> createTutorPackage(
            @Valid @RequestBody TutorPackageRequest request
    ) {
        Long tutorUserId = getCurrentUserId();
        TutorPackageCreateResponse response = tutorPackageService.createTutorPackage(tutorUserId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/package/{packageId}")
    public ResponseEntity<OperationStatusResponse> updateTutorPackage(
            @PathVariable Long packageId,
            @Valid @RequestBody TutorPackageRequest request
    ) {
        Long tutorUserId = getCurrentUserId();
        OperationStatusResponse response = tutorPackageService.updateTutorPackage(tutorUserId, packageId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/package/{packageId}")
    public ResponseEntity<OperationStatusResponse> deleteTutorPackage(
            @PathVariable Long packageId
    ) {
        Long tutorUserId = getCurrentUserId();
        OperationStatusResponse response = tutorPackageService.deleteTutorPackage(tutorUserId, packageId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{tutorId}/packages")
    public ResponseEntity<TutorPackageListResponse> getTutorPackages(@PathVariable Long tutorId) {
        TutorPackageListResponse response = tutorPackageService.getPackagesByTutor(tutorId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/package/{packageId}")
    public ResponseEntity<TutorPackageResponse> getTutorPackageDetail(@PathVariable Long packageId) {
        TutorPackageResponse response = tutorPackageService.getPackageDetail(packageId);
        return ResponseEntity.ok(response);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            Object userId = jwt.getClaim("userId");
            if (userId instanceof Integer) {
                return ((Integer) userId).longValue();
            } else if (userId instanceof Long) {
                return (Long) userId;
            } else if (userId instanceof Number) {
                return ((Number) userId).longValue();
            }
        } else if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUserId();
        }
        throw new RuntimeException("User not authenticated");
    }
}


