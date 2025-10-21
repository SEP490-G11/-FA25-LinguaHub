package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "Feedback")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long feedbackID;

    @ManyToOne @JoinColumn(name = "userID")
    User user;

    @ManyToOne @JoinColumn(name = "paymentID")
    Payment payment;

    Integer rating;
    @Column(columnDefinition = "TEXT")
    String comment;
}
