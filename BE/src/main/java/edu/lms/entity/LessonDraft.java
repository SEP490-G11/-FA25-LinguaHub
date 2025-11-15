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
@Table(name = "LessonDraft")
public class LessonDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long lessonDraftID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sectionDraftID", nullable = false)
    CourseSectionDraft sectionDraft;

    Long originalLessonID; // 🔹 ID bài học gốc (nullable)

    String title;
    Short duration;
    LessonType lessonType;
    String videoURL;
    @Lob
    String content;
    Integer orderIndex;

    @OneToMany(mappedBy = "lessonDraft", cascade = CascadeType.ALL, orphanRemoval = true)
    List<LessonResourceDraft> resources;
}

