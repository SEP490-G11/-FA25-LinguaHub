package edu.lms.service;

import edu.lms.dto.request.TutorApplyRequest;
import edu.lms.dto.response.TutorApplicationDetailResponse;
import edu.lms.dto.response.TutorApplicationListResponse;
import edu.lms.dto.response.TutorApplyResponse;

import java.util.List;

public interface TutorService {
    void applyToBecomeTutor(Long userId, TutorApplyRequest request);
    TutorApplyResponse getApplicationStatus(Long userId);
    
    // Admin methods
    List<TutorApplicationListResponse> getPendingApplications();
    TutorApplicationDetailResponse getApplicationDetail(Long verificationId);
    void approveTutorApplication(Long verificationId, Long adminId);
    void rejectTutorApplication(Long verificationId, Long adminId, String reason);
    List<TutorApplicationListResponse> getAllTutors(String status);
    void suspendTutor(Long tutorId, Long adminId);
    void unsuspendTutor(Long tutorId, Long adminId);
}
