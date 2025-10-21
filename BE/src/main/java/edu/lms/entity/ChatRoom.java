package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "ChatRoom")
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long chatRoomID;

    String title;
    @Column(columnDefinition = "TEXT")
    String description;

    @ManyToOne @JoinColumn(name = "userID")
    User user;

    @ManyToOne @JoinColumn(name = "tutorID")
    Tutor tutor;

    String chatRoomType; // Advice / Training

    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL)
    List<ChatRoomMessage> messages;
}
