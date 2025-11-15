package edu.lms.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TutorPackageRequest {

    @NotBlank(message = "Package name must not be blank")
    @Size(max = 100, message = "Package name must not exceed 100 characters")
    String name;

    String description;

    @NotNull(message = "maxSlot is required")
    @Min(value = 1, message = "maxSlot must be greater than 0")
    Integer maxSlot;

    @NotNull(message = "Price can't null")
    BigDecimal price;

}


