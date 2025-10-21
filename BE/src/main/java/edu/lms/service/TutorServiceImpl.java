package edu.lms.service;

import edu.lms.dto.request.TutorApplyRequest;
import edu.lms.dto.response.TutorApplyResponse;
import edu.lms.entity.Tutor;
import edu.lms.entity.TutorVerification;
import edu.lms.entity.User;
import edu.lms.enums.TutorStatus;
import edu.lms.enums.TutorVerificationStatus;
import edu.lms.repository.TutorRepository;
import edu.lms.repository.TutorVerificationRepository;
import edu.lms.repository.UserRepository;
import edu.lms.service.TutorService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TutorServiceImpl implements TutorService {

    private final TutorRepository tutorRepository;
    private final TutorVerificationRepository tutorVerificationRepository;
    private final UserRepository userRepository;

    @Override
    public void applyToBecomeTutor(String userId, TutorApplyRequest request) {
        // 1. Lấy user từ database
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // 2. Kiểm tra có Tutor record chưa
        Tutor tutor = tutorRepository.findByUser(user)
                .orElseGet(() -> {
                    Tutor newTutor = Tutor.builder()
                            .user(user)
                            .experience((short) 0)
                            .status(TutorStatus.PENDING)
                            .rating(null)
                            .build();
                    return tutorRepository.save(newTutor);
                });

        // 3. Kiểm tra đã có hồ sơ đang pending chưa
        boolean isPending = tutorVerificationRepository.existsByTutorAndStatus(tutor, TutorVerificationStatus.PENDING);
        if (isPending) {
            throw new IllegalStateException("An application is already pending approval");
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
    }

    @Override
    public TutorApplyResponse getApplicationStatus(String userId) {
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Tutor tutor = tutorRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Tutor record not found"));

        return tutorVerificationRepository.findTopByTutorOrderBySubmittedAtDesc(tutor)
                .map(v -> TutorApplyResponse.builder()
                        .status(v.getStatus().name())
                        .submittedAt(v.getSubmittedAt())
                        .reasonForReject(v.getReasonForReject())
                        .build())
                .orElseThrow(() -> new EntityNotFoundException("No application found"));
    }
}
