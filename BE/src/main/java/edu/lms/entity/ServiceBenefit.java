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
@Table(name = "ServiceBenefit")
public class ServiceBenefit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long benefitID;

    String title;
    String description;
    Integer numberUsage;

    @ManyToOne
    @JoinColumn(name = "serviceID")
    Service service;
}
