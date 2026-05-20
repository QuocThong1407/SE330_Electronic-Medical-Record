package com.emr.emr_system.modules.doctor.dto;

import com.emr.emr_system.shared.enums.Gender;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class DoctorAdminCreateRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Gender is required")
    private Gender gender;

    private UUID departmentId;

    private String phone;
    private String emailContact;
    private String degree;

    @NotNull(message = "Experience years is required")
    @Min(value = 0, message = "Experience years must be greater than or equal to 0")
    private Integer experienceYears;

    private LocalDate dateOfBirth;
}
