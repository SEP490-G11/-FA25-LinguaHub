package edu.lms.entity;

import edu.lms.enums.CourseStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "Courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long courseID;

    String title;

    @Column(columnDefinition = "TEXT")
    String description;

    Integer duration;
    BigDecimal price;
    String language;
    String thumbnailURL;

    @Enumerated(EnumType.STRING)
    CourseStatus status = CourseStatus.Draft;

    LocalDateTime createdAt = LocalDateTime.now();
    LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "tutorID")
    Tutor tutor;

    @ManyToOne
    @JoinColumn(name = "categoryID")
    CourseCategory category;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    List<CourseSection> sections;
}
