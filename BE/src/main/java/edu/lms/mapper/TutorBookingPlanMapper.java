package edu.lms.mapper;

import edu.lms.dto.request.TutorBookingPlanRequest;
import edu.lms.dto.response.TutorBookingPlanResponse;
import edu.lms.entity.BookingPlan;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface TutorBookingPlanMapper {
    TutorBookingPlanMapper INSTANCE = Mappers.getMapper(TutorBookingPlanMapper.class);

    BookingPlan toEntity(TutorBookingPlanRequest request);
    TutorBookingPlanResponse toResponse(BookingPlan bookingPlan);
}
