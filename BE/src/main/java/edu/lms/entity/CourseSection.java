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
@Table(name = "CourseSection")
public class CourseSection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long sectionID;

    @ManyToOne
    @JoinColumn(name = "courseID", nullable = false)
    Course course;

    String title;
    String description;
    Integer orderIndex;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL)
    List<Lesson> lessons;
}
