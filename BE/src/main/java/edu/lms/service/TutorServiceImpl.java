package edu.lms.service;

import edu.lms.entity.Tutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public class TutorServiceImpl implements TutorService {


    @Override
    public Page<Tutor> listTutors(String keyword, String status, Pageable pageable) {
        return null;
    }

    @Override
    public Optional<Tutor> getTutorDetails(Long tutorId) {
        return Optional.empty();
    }

    @Override
    public Tutor approveTutor(Long tutorId, Long adminId) {
        return null;
    }

    @Override
    public Tutor rejectTutor(Long tutorId, Long adminId, String reason) {
        return null;
    }

    @Override
    public Tutor suspendTutor(Long tutorId, Long adminId) {
        return null;
    }

    @Override
    public Tutor activateTutor(Long tutorId, Long adminId) {
        return null;
    }

    @Override
    public Tutor updateTutorInfo(Long tutorId, Short experience, String specialization) {
        return null;
    }
}
