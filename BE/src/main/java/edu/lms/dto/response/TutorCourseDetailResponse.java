package edu.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TutorCourseDetailResponse {
    Long id;
    String title;
    String description;
    Integer duration;
    BigDecimal price;
    String language;
    String thumbnailURL;
    String categoryName;
    String status;

    // Thêm phần detail
    List<CourseSectionResponse> section;
}
