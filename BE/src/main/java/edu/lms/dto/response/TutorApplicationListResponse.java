
package edu.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TutorApplicationListResponse {
    Long verificationId;
    Long tutorId;
    Long userId;
    String userEmail;
    String userName;
    String avatarURL;
    String country;
    String specialization;
    String teachingLanguage;
    String status;
    LocalDateTime submittedAt;
    LocalDateTime reviewedAt;
}
