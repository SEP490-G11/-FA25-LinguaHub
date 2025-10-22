package edu.lms.service;

import edu.lms.dto.request.TutorApplyRequest;
import edu.lms.dto.response.TutorApplicationDetailResponse;
import edu.lms.dto.response.TutorApplicationListResponse;
import edu.lms.dto.response.TutorApplyResponse;
import edu.lms.entity.Tutor;
import edu.lms.entity.TutorVerification;
import edu.lms.entity.User;
import edu.lms.enums.TutorStatus;
import edu.lms.enums.TutorVerificationStatus;
import edu.lms.exception.TutorApplicationException;
import edu.lms.exception.TutorNotFoundException;
import edu.lms.repository.TutorRepository;
import edu.lms.repository.TutorVerificationRepository;
import edu.lms.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TutorServiceImpl implements TutorService {

    private final TutorRepository tutorRepository;
    private final TutorVerificationRepository tutorVerificationRepository;
    private final UserRepository userRepository;

    @Override
    public void applyToBecomeTutor(Long userId, TutorApplyRequest request) {
        log.info("Processing tutor application for user ID: {}", userId);
        
        // 1. Lấy user từ database
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        // 2. Kiểm tra có Tutor record chưa
        Tutor tutor = tutorRepository.findByUser(user)
                .orElseGet(() -> {
                    log.info("Creating new tutor record for user ID: {}", userId);
                    Tutor newTutor = Tutor.builder()
                            .user(user)
                            .experience((short) 0)
                            .status(TutorStatus.PENDING)
                            .rating(BigDecimal.ZERO)
                            .build();
                    return tutorRepository.save(newTutor);
                });

        // 3. Kiểm tra đã có hồ sơ đang pending chưa
        boolean isPending = tutorVerificationRepository.existsByTutorAndStatus(tutor, TutorVerificationStatus.PENDING);
        if (isPending) {
            log.warn("User {} already has a pending tutor application", userId);
            throw new TutorApplicationException("An application is already pending approval");
        }

        // 4. Tạo đơn xác minh mới
        TutorVerification verification = TutorVerification.builder()
                .tutor(tutor)
                .experience(request.getExperience())
                .specialization(request.getSpecialization())
                .teachingLanguage(request.getTeachingLanguage())
                .certificateName(request.getCertificateName())
                .bio(request.getBio())
                .documentURL(request.getDocumentURL())
                .status(TutorVerificationStatus.PENDING)
                .submittedAt(LocalDateTime.now())
                .build();

        tutorVerificationRepository.save(verification);
        log.info("Tutor application submitted successfully for user ID: {}", userId);
    }

    @Override
    public TutorApplyResponse getApplicationStatus(Long userId) {
        log.info("Getting application status for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        Tutor tutor = tutorRepository.findByUser(user)
                .orElseThrow(() -> new TutorNotFoundException("Tutor record not found for user ID: " + userId));

        return tutorVerificationRepository.findTopByTutorOrderBySubmittedAtDesc(tutor)
                .map(v -> {
                    log.info("Found application with status: {} for user ID: {}", v.getStatus(), userId);
                    return TutorApplyResponse.builder()
                        .status(v.getStatus().name())
                        .submittedAt(v.getSubmittedAt())
                        .reasonForReject(v.getReasonForReject())
                            .build();
                })
                .orElseThrow(() -> new TutorNotFoundException("No application found for user ID: " + userId));
    }

    // Admin methods
    @Override
    public List<TutorApplicationListResponse> getPendingApplications() {
        log.info("Getting all pending tutor applications");
        
        List<TutorVerification> pendingVerifications = 
            tutorVerificationRepository.findAllByStatusOrderBySubmittedAtAsc(TutorVerificationStatus.PENDING);
        
        log.info("Found {} pending applications", pendingVerifications.size());
        
        return pendingVerifications.stream()
                .map(this::mapToApplicationListResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TutorApplicationDetailResponse getApplicationDetail(Long verificationId) {
        log.info("Getting application detail for verification ID: {}", verificationId);
        
        TutorVerification verification = tutorVerificationRepository.findById(verificationId)
                .orElseThrow(() -> new EntityNotFoundException("Application not found with ID: " + verificationId));
        
        return mapToApplicationDetailResponse(verification);
    }

    @Override
    public void approveTutorApplication(Long verificationId, Long adminId) {
        log.info("Processing tutor application approval for verification ID: {} by admin ID: {}", verificationId, adminId);
        
        TutorVerification verification = tutorVerificationRepository.findById(verificationId)
                .orElseThrow(() -> new EntityNotFoundException("Application not found with ID: " + verificationId));
        
        if (verification.getStatus() != TutorVerificationStatus.PENDING) {
            log.warn("Attempted to approve non-pending application with ID: {}, current status: {}", verificationId, verification.getStatus());
            throw new TutorApplicationException("Application is not in pending status");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new EntityNotFoundException("Admin not found with ID: " + adminId));

        // Update verification status
        verification.setStatus(TutorVerificationStatus.APPROVED);
        verification.setReviewedBy(admin);
        verification.setReviewedAt(LocalDateTime.now());
        tutorVerificationRepository.save(verification);

        // Update tutor status and information
        Tutor tutor = verification.getTutor();
        tutor.setStatus(TutorStatus.APPROVED);
        tutor.setExperience(verification.getExperience());
        tutor.setSpecialization(verification.getSpecialization());
        tutor.setTeachingLanguage(verification.getTeachingLanguage());
        tutor.setBio(verification.getBio());
        tutorRepository.save(tutor);
        
        log.info("Tutor application approved successfully for verification ID: {}, tutor ID: {}", verificationId, tutor.getTutorID());
    }

    @Override
    public void rejectTutorApplication(Long verificationId, Long adminId, String reason) {
        log.info("Processing tutor application rejection for verification ID: {} by admin ID: {} with reason: {}", verificationId, adminId, reason);
        
        TutorVerification verification = tutorVerificationRepository.findById(verificationId)
                .orElseThrow(() -> new EntityNotFoundException("Application not found with ID: " + verificationId));
        
        if (verification.getStatus() != TutorVerificationStatus.PENDING) {
            log.warn("Attempted to reject non-pending application with ID: {}, current status: {}", verificationId, verification.getStatus());
            throw new TutorApplicationException("Application is not in pending status");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new EntityNotFoundException("Admin not found with ID: " + adminId));

        // Update verification status
        verification.setStatus(TutorVerificationStatus.REJECTED);
        verification.setReviewedBy(admin);
        verification.setReviewedAt(LocalDateTime.now());
        verification.setReasonForReject(reason);
        tutorVerificationRepository.save(verification);
        
        log.info("Tutor application rejected successfully for verification ID: {}, tutor ID: {}", verificationId, verification.getTutor().getTutorID());
    }

    @Override
    public List<TutorApplicationListResponse> getAllTutors(String status) {
        log.info("Getting all tutors with status filter: {}", status);
        
        List<Tutor> tutors;
        if (status != null && !status.isEmpty()) {
            try {
                TutorStatus tutorStatus = TutorStatus.valueOf(status.toUpperCase());
                tutors = tutorRepository.findAllByStatus(tutorStatus);
                log.info("Found {} tutors with status: {}", tutors.size(), status);
            } catch (IllegalArgumentException e) {
                log.error("Invalid status provided: {}", status);
                throw new IllegalArgumentException("Invalid status: " + status);
            }
        } else {
            tutors = tutorRepository.findAll();
            log.info("Found {} total tutors", tutors.size());
        }
        
        return tutors.stream()
                .map(tutor -> {
                    TutorVerification latestVerification = 
                        tutorVerificationRepository.findTopByTutorOrderBySubmittedAtDesc(tutor)
                            .orElse(null);
                    
                    return TutorApplicationListResponse.builder()
                            .verificationId(latestVerification != null ? latestVerification.getTutorVerificationID() : null)
                            .tutorId(tutor.getTutorID())
                            .userId(tutor.getUser().getUserID())
                            .userEmail(tutor.getUser().getEmail())
                            .userName(tutor.getUser().getFullName())
                            .specialization(tutor.getSpecialization())
                            .teachingLanguage(tutor.getTeachingLanguage())
                            .status(tutor.getStatus().name())
                            .submittedAt(latestVerification != null ? latestVerification.getSubmittedAt() : null)
                            .reviewedAt(latestVerification != null ? latestVerification.getReviewedAt() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public void suspendTutor(Long tutorId, Long adminId) {
        log.info("Suspending tutor ID: {} by admin ID: {}", tutorId, adminId);
        
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new TutorNotFoundException("Tutor not found with ID: " + tutorId));
        
        tutor.setStatus(TutorStatus.SUSPENDED);
        tutorRepository.save(tutor);
        
        log.info("Tutor suspended successfully: {}", tutorId);
    }

    @Override
    public void unsuspendTutor(Long tutorId, Long adminId) {
        log.info("Unsuspending tutor ID: {} by admin ID: {}", tutorId, adminId);
        
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new TutorNotFoundException("Tutor not found with ID: " + tutorId));
        
        tutor.setStatus(TutorStatus.APPROVED);
        tutorRepository.save(tutor);
        
        log.info("Tutor unsuspended successfully: {}", tutorId);
    }

    // Helper methods
    private TutorApplicationListResponse mapToApplicationListResponse(TutorVerification verification) {
        Tutor tutor = verification.getTutor();
        User user = tutor.getUser();
        
        return TutorApplicationListResponse.builder()
                .verificationId(verification.getTutorVerificationID())
                .tutorId(tutor.getTutorID())
                .userId(user.getUserID())
                .userEmail(user.getEmail())
                .userName(user.getFullName())
                .specialization(verification.getSpecialization())
                .teachingLanguage(verification.getTeachingLanguage())
                .status(verification.getStatus().name())
                .submittedAt(verification.getSubmittedAt())
                .reviewedAt(verification.getReviewedAt())
                .build();
    }

    private TutorApplicationDetailResponse mapToApplicationDetailResponse(TutorVerification verification) {
        Tutor tutor = verification.getTutor();
        User user = tutor.getUser();
        
        return TutorApplicationDetailResponse.builder()
                .verificationId(verification.getTutorVerificationID())
                .tutorId(tutor.getTutorID())
                .userId(user.getUserID())
                .userEmail(user.getEmail())
                .userName(user.getFullName())
                .userPhone(user.getPhone())
                .experience(verification.getExperience())
                .specialization(verification.getSpecialization())
                .teachingLanguage(verification.getTeachingLanguage())
                .bio(verification.getBio())
                .certificateName(verification.getCertificateName())
                .documentURL(verification.getDocumentURL())
                .status(verification.getStatus().name())
                .submittedAt(verification.getSubmittedAt())
                .reviewedBy(verification.getReviewedBy() != null ? 
                    verification.getReviewedBy().getFullName() : null)
                .reviewedAt(verification.getReviewedAt())
                .reasonForReject(verification.getReasonForReject())
                .build();
    }
}
