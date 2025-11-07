package edu.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseDetailResponse {
    Long id;
    String title;
    String description;
    Integer duration;
    BigDecimal price;
    String language;
    String thumbnailURL;
    String categoryName;
    String tutorName;

}
