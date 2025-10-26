package edu.lms.entity;

import edu.lms.enums.LessonType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;
import java.util.List;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sectionID", nullable = false)
    CourseSection section;

    @Column(nullable = false)
    String title;

    Short duration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    LessonType lessonType = LessonType.Video; // Default value

    String videoURL;

    @Lob
    String content;

    Integer orderIndex;

    @Column(updatable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
    List<LessonResource> resources;
}
