package edu.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
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

    String title;
    Integer duration;

    @Column(columnDefinition = "TEXT")
    String description;

    BigDecimal price = BigDecimal.ZERO;

    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL)
    List<ServiceBenefit> benefits;
}
