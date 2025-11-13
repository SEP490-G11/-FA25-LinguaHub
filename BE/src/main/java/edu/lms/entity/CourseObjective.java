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
@Table(name = "CourseObjective")
public class CourseObjective {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long objectiveID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "courseID", nullable = false)
    Course course;

    @Column(nullable = false, length = 255)
    String objectiveText; // 🔹 Nội dung mục tiêu: “Achieve learning outcomes for Band 7+”, “Improve writing accuracy”…

    @Column(nullable = false)
    @Builder.Default
    Integer orderIndex = 1; // 🔹 Thứ tự hiển thị
}
