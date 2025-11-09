package edu.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedbackResponse {
    Long feedbackID;
    String userFullName;
    String userAvatarURL;
    Integer rating;
    String comment;
    LocalDateTime createdAt;
}
