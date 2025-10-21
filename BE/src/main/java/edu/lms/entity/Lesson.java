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
@Table(name = "Lessons")
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long lessonID;

    @ManyToOne
    @JoinColumn(name = "sectionID", nullable = false)
    CourseSection section;

    String title;
    Short duration;
    String videoURL;
}
