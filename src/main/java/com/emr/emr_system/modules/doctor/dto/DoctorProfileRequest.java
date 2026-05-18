package com.emr.emr_system.modules.doctor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DoctorProfileRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Gender is required")
    private String gender;

    private String phone;
    private String emailContact;
    private String specialization;
    private LocalDate dateOfBirth;
}
