package edu.lms.entity;

import edu.lms.enums.BookingStatus;
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
@Table(name = "Booking")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long bookingID;

    @ManyToOne @JoinColumn(name = "userID")
    User user;

    @ManyToOne @JoinColumn(name = "tutorID")
    Tutor tutor;

    @ManyToOne @JoinColumn(name = "scheduleID")
    Schedule schedule;

    @ManyToOne @JoinColumn(name = "userServiceID")
    UserService userService;

    @Enumerated(EnumType.STRING)
    BookingStatus status = BookingStatus.Pending;

    LocalDateTime createdAt = LocalDateTime.now();
    LocalDateTime updatedAt = LocalDateTime.now();
}
