package edu.lms.service;

import edu.lms.dto.response.BookingPlanSlotResponse;
import edu.lms.entity.BookingPlan;
import edu.lms.entity.BookingPlanSlot;
import edu.lms.entity.Tutor;
import edu.lms.enums.SlotStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.BookingPlanRepository;
import edu.lms.repository.BookingPlanSlotRepository;
import edu.lms.repository.TutorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingPlanSlotService {

    private final BookingPlanSlotRepository bookingPlanSlotRepository;
    private final BookingPlanRepository bookingPlanRepository;
    private final TutorRepository tutorRepository;

    public List<BookingPlanSlotResponse> getSlotsForUser(Long userId) {
        List<BookingPlanSlot> slots = bookingPlanSlotRepository.findByUserID(userId);
        
        // Nếu không có slot, trả về empty list
        if (slots.isEmpty()) {
            return List.of();
        }
        
        // Lấy tất cả booking plan IDs để query meetingUrl
        List<Long> bookingPlanIds = slots.stream()
                .map(BookingPlanSlot::getBookingPlanID)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
        
        // Lấy meetingUrl từ các booking plans (chỉ query nếu có IDs)
        Map<Long, String> meetingUrlMap = bookingPlanIds.isEmpty() 
                ? Map.of()
                : bookingPlanRepository.findAllById(bookingPlanIds)
                        .stream()
                        .filter(plan -> plan != null && plan.getBookingPlanID() != null)
                        .collect(Collectors.toMap(
                                BookingPlan::getBookingPlanID,
                                plan -> plan.getMeetingUrl() != null ? plan.getMeetingUrl() : "",
                                (existing, replacement) -> existing
                        ));
        
        // Convert to DTO, chỉ trả về meetingUrl khi status = Paid
        return slots.stream()
                .map(slot -> toSlotResponse(slot, meetingUrlMap))
                .collect(Collectors.toList());
    }

    public List<BookingPlanSlotResponse> getSlotsForTutor(Long userId) {
        Tutor tutor = tutorRepository.findByUser_UserID(userId)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        List<BookingPlanSlot> slots = bookingPlanSlotRepository.findByTutorID(tutor.getTutorID());
        
        // Nếu không có slot, trả về empty list
        if (slots.isEmpty()) {
            return List.of();
        }
        
        // Lấy tất cả booking plan IDs để query meetingUrl
        List<Long> bookingPlanIds = slots.stream()
                .map(BookingPlanSlot::getBookingPlanID)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
        
        // Lấy meetingUrl từ các booking plans (chỉ query nếu có IDs)
        Map<Long, String> meetingUrlMap = bookingPlanIds.isEmpty()
                ? Map.of()
                : bookingPlanRepository.findAllById(bookingPlanIds)
                        .stream()
                        .filter(plan -> plan != null && plan.getBookingPlanID() != null)
                        .collect(Collectors.toMap(
                                BookingPlan::getBookingPlanID,
                                plan -> plan.getMeetingUrl() != null ? plan.getMeetingUrl() : "",
                                (existing, replacement) -> existing
                        ));
        
        // Convert to DTO, chỉ trả về meetingUrl khi status = Paid
        return slots.stream()
                .map(slot -> toSlotResponse(slot, meetingUrlMap))
                .collect(Collectors.toList());
    }
    
    private BookingPlanSlotResponse toSlotResponse(BookingPlanSlot slot, Map<Long, String> meetingUrlMap) {
        // Chỉ trả về meetingUrl khi slot đã thanh toán (status = Paid)
        String meetingUrl = null;
        if (slot.getStatus() == SlotStatus.Paid && slot.getBookingPlanID() != null) {
            meetingUrl = meetingUrlMap.get(slot.getBookingPlanID());
            // Nếu meetingUrl là empty string, set về null
            if (meetingUrl != null && meetingUrl.isEmpty()) {
                meetingUrl = null;
            }
        }
        
        return BookingPlanSlotResponse.builder()
                .slotID(slot.getSlotID())
                .bookingPlanID(slot.getBookingPlanID())
                .tutorID(slot.getTutorID())
                .userID(slot.getUserID())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .paymentID(slot.getPaymentID())
                .status(slot.getStatus())
                .lockedAt(slot.getLockedAt())
                .expiresAt(slot.getExpiresAt())
                .meetingUrl(meetingUrl)
                .build();
    }
}
