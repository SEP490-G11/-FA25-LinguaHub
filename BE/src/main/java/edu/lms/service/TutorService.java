package edu.lms.service;

import edu.lms.entity.Tutor;

import java.util.List;
import java.util.Optional;

public interface TutorService {

    Tutor createTutor(Tutor tutor);

    Optional<Tutor> getTutorById(Long tutorId);

    Optional<Tutor> getTutorByUserId(Long userId);

    List<Tutor> getAllTutors();

    Tutor updateTutor(Long tutorId, Tutor updatedTutor);

    void deleteTutor(Long tutorId);
}
