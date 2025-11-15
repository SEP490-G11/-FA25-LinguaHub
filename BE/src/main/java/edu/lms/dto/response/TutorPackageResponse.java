package edu.lms.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TutorPackageResponse {
    Long packageId;
    Long tutorId;
    String name;
    String description;
    Integer maxSlot;
    Boolean active;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}


