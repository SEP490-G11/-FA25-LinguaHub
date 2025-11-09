package edu.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseResponse {
    Long id;
    String title;
    String description;
    Integer duration;
    BigDecimal price;
    String language;
    String thumbnailURL;
    String categoryName;
    String tutorName;
    String status;
    Boolean isWishListed;

    Boolean isPurchased;

    Long learnerCount;
    String tutorAvatarURL;
    String tutorAddress;
    Double avgRating;
    Integer totalRatings;
    LocalDateTime createdAt;
}
