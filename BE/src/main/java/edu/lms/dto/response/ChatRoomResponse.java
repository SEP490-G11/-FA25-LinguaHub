package edu.lms.dto.response;

import edu.lms.enums.ChatRoomType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatRoomResponse {
    Long chatRoomID;
    String title;
    String description;
    Long userID;
    String userName;
    String userAvatarURL;
    Long tutorID;
    String tutorName;
    String tutorAvatarURL;
    ChatRoomType chatRoomType;
    LocalDateTime createdAt;
    List<ChatMessageResponse> messages;
    Boolean canSendMessage; // Based on business rules (tutor suspended, booking cancelled, etc.)
}


