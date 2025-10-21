package edu.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TutorApplicationDetailResponse {
    Long verificationId;
    Long tutorId;
    Long userId;
    String userEmail;
    String userName;
    String userPhone;
    
    Short experience;
    String specialization;
    String teachingLanguage;
    String bio;
    String certificateName;
    String documentURL;
    
    String status;
    LocalDateTime submittedAt;
    String reviewedBy;
    LocalDateTime reviewedAt;
    String reasonForReject;
}