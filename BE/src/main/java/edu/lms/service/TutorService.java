package edu.lms.service;

import edu.lms.entity.Tutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface TutorService {

    // 1. List/Search Tutors (Admin Only)
    Page<Tutor> listTutors(String keyword, String status, Pageable pageable);

    // 2. View tutor details (Admin Only)
    Optional<Tutor> getTutorDetails(Long tutorId);

    // 3. Approve tutor (Pending → Approved)
    Tutor approveTutor(Long tutorId, Long adminId);

    // 4. Reject tutor (Pending → Rejected)
    Tutor rejectTutor(Long tutorId, Long adminId, String reason);

    // 5. Suspend tutor (Approved → Suspended)
    Tutor suspendTutor(Long tutorId, Long adminId);

    // 6. Reactivate tutor (Suspended → Approved)
    Tutor activateTutor(Long tutorId, Long adminId);

    // 7. Optional: Update info (experience, specialization)
    Tutor updateTutorInfo(Long tutorId, Short experience, String specialization);
}
