package edu.lms.mapper;

import edu.lms.dto.request.TutorBookingPlanRequest;
import edu.lms.dto.response.TutorBookingPlanResponse;
import edu.lms.entity.BookingPlan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TutorBookingPlanMapper {

    @Mapping(target = "pricePerSlot", source = "pricePerSlot")
    @Mapping(target = "slotDuration", source = "slotDuration")
    @Mapping(target = "startHour", source = "startHour")
    @Mapping(target = "endHour", source = "endHour")
    @Mapping(target = "activeDays", source = "activeDays")
    @Mapping(target = "weekToGenerate", source = "weekToGenerate")
    @Mapping(target = "maxLearners", source = "maxLearners")
    @Mapping(target = "bookingPlanID", ignore = true)
    @Mapping(target = "tutor", ignore = true)
    @Mapping(target = "availableSlots", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "benefits", ignore = true)
    BookingPlan toEntity(TutorBookingPlanRequest request);

    @Mapping(target = "bookingPlanID", source = "bookingPlanID")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "slotDuration", source = "slotDuration")
    @Mapping(target = "pricePerSlot", source = "pricePerSlot")
    @Mapping(target = "startHour", expression = "java(bookingPlan.getStartHour() != null ? bookingPlan.getStartHour().toString() : null)")
    @Mapping(target = "endHour", expression = "java(bookingPlan.getEndHour() != null ? bookingPlan.getEndHour().toString() : null)")
    @Mapping(target = "activeDays", source = "activeDays")
    @Mapping(target = "weekToGenerate", source = "weekToGenerate")
    @Mapping(target = "maxLearners", source = "maxLearners")
    @Mapping(target = "tutorName", source = "tutor.user.fullName")
    @Mapping(target = "numberOfGeneratedSlots", ignore = true)
    TutorBookingPlanResponse toResponse(BookingPlan bookingPlan);
}
