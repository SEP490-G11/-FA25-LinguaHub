//package edu.lms.mapper;
//
//import edu.lms.dto.request.TutorBookingPlanRequest;
//import edu.lms.dto.response.TutorBookingPlanResponse;
//import edu.lms.entity.BookingPlan;
//import org.mapstruct.Mapper;
//import org.mapstruct.Mapping;
//
//@Mapper(componentModel = "spring")
//public interface TutorBookingPlanMapper {
//
//    /**
//     * Map từ Request sang Entity
//     * Bỏ qua các fields: bookingPlanID (auto-generated), tutor (set thủ công),
//     * availableSlots (tính toán), createdAt/updatedAt (tự động), benefits (không có trong request)
//     */
//    @Mapping(target = "title", source = "title")
//    @Mapping(target = "description", source = "description")
//    @Mapping(target = "slotDuration", source = "slotDuration")
//    @Mapping(target = "pricePerSlot", source = "pricePerSlot")
//    @Mapping(target = "startHour", source = "startHour")
//    @Mapping(target = "endHour", source = "endHour")
//    @Mapping(target = "activeDays", source = "activeDays")
//    @Mapping(target = "weekToGenerate", source = "weekToGenerate")
//    @Mapping(target = "maxLearners", source = "maxLearners")
//    @Mapping(target = "bookingPlanID", ignore = true)
//    @Mapping(target = "tutor", ignore = true)
//    @Mapping(target = "availableSlots", ignore = true)
//    @Mapping(target = "createdAt", ignore = true)
//    @Mapping(target = "updatedAt", ignore = true)
//    @Mapping(target = "benefits", ignore = true)
//    BookingPlan toEntity(TutorBookingPlanRequest request);
//
//    /**
//     * Map từ Entity sang Response
//     * startHour và endHour là Integer trong cả Entity và Response nên map trực tiếp
//     */
//    @Mapping(target = "bookingPlanID", source = "bookingPlanID")
//    @Mapping(target = "title", source = "title")
//    @Mapping(target = "description", source = "description")
//    @Mapping(target = "slotDuration", source = "slotDuration")
//    @Mapping(target = "pricePerSlot", source = "pricePerSlot")
//    @Mapping(target = "startHour", source = "startHour")
//    @Mapping(target = "endHour", source = "endHour")
//    @Mapping(target = "activeDays", source = "activeDays")
//    @Mapping(target = "weekToGenerate", source = "weekToGenerate")
//    @Mapping(target = "maxLearners", source = "maxLearners")
//    @Mapping(target = "availableSlots", source = "availableSlots")
//    @Mapping(target = "createdAt", source = "createdAt")
//    @Mapping(target = "updatedAt", source = "updatedAt")
//    @Mapping(target = "tutorName", source = "tutor.user.fullName")
//    @Mapping(target = "numberOfGeneratedSlots", ignore = true)
//    TutorBookingPlanResponse toResponse(BookingPlan bookingPlan);
//}
