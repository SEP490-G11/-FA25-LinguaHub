package edu.lms.service;

import edu.lms.dto.request.TutorBookingPlanRequest;
import edu.lms.dto.response.TutorBookingPlanResponse;
import edu.lms.entity.BookingPlan;
import edu.lms.entity.Tutor;
import edu.lms.enums.TutorStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.mapper.TutorBookingPlanMapper;
import edu.lms.repository.BookingPlanRepository;
import edu.lms.repository.TutorRepository;
import edu.lms.repository.UserBookingPlanRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class TutorBookingPlanService {

    BookingPlanRepository bookingPlanRepository;
    TutorRepository tutorRepository;
    UserBookingPlanRepository userBookingPlanRepository;
    TutorBookingPlanMapper mapper;

    // CREATE
    public TutorBookingPlanResponse createBookingPlan(TutorBookingPlanRequest request) {
        Tutor tutor = tutorRepository.findById(request.getTutorID())
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        if (tutor.getStatus() != TutorStatus.APPROVED)
            throw new AppException(ErrorCode.TUTOR_NOT_APPROVED);

        BookingPlan bookingPlan = mapper.toEntity(request);
        bookingPlan.setTutor(tutor);
// Tính tổng số slot khả dụng dựa trên khung giờ và số ngày hoạt động
        int totalMinutes = (request.getEndHour() - request.getStartHour()) * 60;
        int slotsPerDay = totalMinutes / request.getSlotDuration();
// Đếm số ngày trong activeDays (VD: "Mon,Tue,Wed,Thu,Fri" => 5)
        int daysActive = request.getActiveDays().split(",").length;
// Tổng số slot = slotsPerDay * daysActive
        int totalSlots = slotsPerDay * daysActive;
        bookingPlan.setAvailableSlots(totalSlots);

        bookingPlanRepository.save(bookingPlan);


        return mapper.toResponse(bookingPlan);
    }

    // GET BY TUTOR
    public List<TutorBookingPlanResponse> getBookingPlansByTutor(Long tutorID) {
        Tutor tutor = tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        return bookingPlanRepository.findByTutor(tutor)
                .stream().map(mapper::toResponse).toList();
    }

    // GET ALL
    public List<TutorBookingPlanResponse> getAllBookingPlans() {
        return bookingPlanRepository.findAll()
                .stream().map(mapper::toResponse).toList();
    }

    // GET BY ID
    public TutorBookingPlanResponse getBookingPlanById(Long id) {
        BookingPlan bookingPlan = bookingPlanRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_PLAN_NOT_FOUND));
        return mapper.toResponse(bookingPlan);
    }

    // UPDATE
    public TutorBookingPlanResponse updateBookingPlan(Long id, TutorBookingPlanRequest request) {
        BookingPlan bookingPlan = bookingPlanRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_PLAN_NOT_FOUND));

        bookingPlan.setTitle(request.getTitle());
        bookingPlan.setDescription(request.getDescription());
        bookingPlan.setSlotDuration(request.getSlotDuration());
        bookingPlan.setPricePerSlot(request.getPricePerSlot());
        bookingPlan.setStartHour(request.getStartHour());
        bookingPlan.setEndHour(request.getEndHour());
        bookingPlan.setActiveDays(request.getActiveDays());
        bookingPlan.setMaxLearners(request.getMaxLearners());
        bookingPlan.setAvailableSlots(request.getAvailableSlots());

        bookingPlanRepository.save(bookingPlan);
        return mapper.toResponse(bookingPlan);
    }

    // DELETE
    public void deleteBookingPlan(Long id) {
        if (userBookingPlanRepository.existsByBookingPlan_BookingPlanID(id))
            throw new AppException(ErrorCode.UNAUTHORIZED);

        bookingPlanRepository.deleteById(id);
    }

}
