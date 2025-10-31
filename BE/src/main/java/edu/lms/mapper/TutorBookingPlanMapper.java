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
    @Mapping(target = "maxLearners", source = "maxLearners")
    BookingPlan toEntity(TutorBookingPlanRequest request);

    @Mapping(target = "bookingPlanID", source = "bookingPlanID")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "slotDuration", source = "slotDuration")
    @Mapping(target = "pricePerSlot", source = "pricePerSlot")
    @Mapping(target = "startHour", source = "startHour")
    @Mapping(target = "endHour", source = "endHour")
    @Mapping(target = "activeDays", source = "activeDays")
    @Mapping(target = "maxLearners", source = "maxLearners")
    @Mapping(target = "tutorName", source = "tutor.user.fullName")
    TutorBookingPlanResponse toResponse(BookingPlan bookingPlan);
}
