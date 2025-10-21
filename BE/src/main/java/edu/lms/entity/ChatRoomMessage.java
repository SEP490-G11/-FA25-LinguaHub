package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "ChatRoomMessage")
public class ChatRoomMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long messageID;

    @ManyToOne
    @JoinColumn(name = "chatRoomID")
    ChatRoom chatRoom;

    @ManyToOne
    @JoinColumn(name = "senderID")
    User sender;

    @Column(columnDefinition = "TEXT")
    String content;

    String messageType; // Text, Image, File
    LocalDateTime createdAt = LocalDateTime.now();
}
