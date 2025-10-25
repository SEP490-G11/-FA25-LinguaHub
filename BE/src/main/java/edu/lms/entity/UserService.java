package edu.lms.entity;

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
@Table(name = "UserService")
public class UserService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long userServiceID;

    @ManyToOne
    @JoinColumn(name = "userID")
    User user;

    @ManyToOne
    @JoinColumn(name = "serviceID")
    Service service;

    LocalDateTime startDate;
    Boolean isActive = true;
    String title;
    Integer duration;

    @OneToMany(mappedBy = "userService", cascade = CascadeType.ALL)
    List<UserServiceBenefit> userServiceBenefits;
}
