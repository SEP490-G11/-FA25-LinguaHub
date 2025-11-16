package edu.lms.mapper;

import edu.lms.dto.response.TutorBookingPlanResponse;
import edu.lms.entity.BookingPlan;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TutorBookingPlanMapper {
    TutorBookingPlanResponse toResponse(BookingPlan plan);
}
