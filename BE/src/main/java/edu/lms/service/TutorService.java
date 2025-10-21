package edu.lms.service;

import edu.lms.dto.request.TutorApplyRequest;
import edu.lms.dto.response.TutorApplyResponse;

public interface TutorService {
    void applyToBecomeTutor(String userId, TutorApplyRequest request);
    TutorApplyResponse getApplicationStatus(String userId);
}
