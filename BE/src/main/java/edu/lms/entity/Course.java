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

    @Column(nullable = false, length = 255)
    String title;

    @Column(columnDefinition = "TEXT")
    String description;

    Integer duration;

    //Cập nhật chuẩn cho kiểu tiền tệ
    @Column(precision = 10, scale = 2, nullable = false)
    @Builder.Default
    BigDecimal price = BigDecimal.ZERO;

    String language;
    String thumbnailURL;

    //Dùng @Enumerated + default
    @Enumerated(EnumType.STRING)
    @Builder.Default
    CourseStatus status = CourseStatus.Draft;

    //Dùng @Builder.Default để không null khi khởi tạo
    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "tutorID", nullable = false)
    Tutor tutor;

    @ManyToOne
    @JoinColumn(name = "categoryID", nullable = false)
    CourseCategory category;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    List<CourseSection> sections;
}
