package edu.lms.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    
    @JsonProperty("packageid")
    Long packageId;
    
    @JsonProperty("tutor_id")
    Long tutorId;
    
    String name;
    
    String description;
    
    @JsonProperty("max_slot")
    Integer maxSlot;
    
    @JsonProperty("is_active")
    Boolean active;
    
    @JsonProperty("created_at")
    LocalDateTime createdAt;
    
    @JsonProperty("updated_at")
    LocalDateTime updatedAt;
}


