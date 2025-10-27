package edu.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TutorServiceResponse {
    Long serviceID;
    String title;
    Integer duration;
    String description;
    BigDecimal price;
    String tutorName;
}
