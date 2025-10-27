package edu.lms.entity;

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
@Table(name = "Services")
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long serviceID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutorID", nullable = false)
    Tutor tutor;

    @Column(nullable = false, length = 255)
    String title;

    Integer duration;

    @Column(columnDefinition = "TEXT")
    String description;

    @Builder.Default
    BigDecimal price = BigDecimal.ZERO;

    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    List<ServiceBenefit> benefits;
}
