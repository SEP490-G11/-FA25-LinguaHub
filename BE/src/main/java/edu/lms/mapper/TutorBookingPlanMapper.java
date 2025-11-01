package edu.lms.mapper;

import edu.lms.dto.request.TutorBookingPlanRequest;
import edu.lms.dto.response.TutorBookingPlanResponse;
import edu.lms.entity.BookingPlan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TutorBookingPlanMapper {

    @Mapping(target = "bookingPlanID", ignore = true)
    @Mapping(target = "tutor", ignore = true)
    @Mapping(target = "benefits", ignore = true)
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
    BookingPlan toEntity(TutorBookingPlanRequest request);

    @Mapping(target = "tutorName", source = "tutor.user.fullName")
    TutorBookingPlanResponse toResponse(BookingPlan bookingPlan);
}
