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
@Table(name = "CourseReview")
public class CourseReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long reviewID;

    @ManyToOne
    @JoinColumn(name = "courseID", nullable = false)
    Course course;

    @ManyToOne
    @JoinColumn(name = "userID", nullable = false)
    User user;

    Integer rating;
    @Column(columnDefinition = "TEXT")
    String comment;

    LocalDateTime createdAt = LocalDateTime.now();
}
