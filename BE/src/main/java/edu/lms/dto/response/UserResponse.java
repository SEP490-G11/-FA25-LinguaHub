package edu.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    //UUID userID;
    Long userID;
    String username;
    String email;
    String fullName;
    String avatarURL;
    String gender;
    LocalDate dob;
    String phone;
    String country;
    String address;
    String bio;
    Boolean isActive;
    String role; // chỉ lấy tên role, ví dụ: "Admin"
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
