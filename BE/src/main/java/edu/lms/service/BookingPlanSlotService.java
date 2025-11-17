package edu.lms.service;

import edu.lms.entity.BookingPlanSlot;
import edu.lms.entity.Tutor;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.BookingPlanSlotRepository;
import edu.lms.repository.TutorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingPlanSlotService {

    private final BookingPlanSlotRepository bookingPlanSlotRepository;
    private final TutorRepository tutorRepository;

    public List<BookingPlanSlot> getSlotsForUser(Long userId) {
        return bookingPlanSlotRepository.findByUserID(userId);
    }

    public List<BookingPlanSlot> getSlotsForTutor(Long userId) {

        Tutor tutor = tutorRepository.findByUser_UserID(userId)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        return bookingPlanSlotRepository.findByTutorID(tutor.getTutorID());
    }
}
