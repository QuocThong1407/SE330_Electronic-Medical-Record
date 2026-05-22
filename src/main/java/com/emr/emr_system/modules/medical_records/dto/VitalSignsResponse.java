package com.emr.emr_system.modules.medical_records.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalSignsResponse {
    private Long id;
    private Long medicalRecordId;
    private BigDecimal temperature;
    private Integer heartRate;
    private Integer bloodPressure;
    private BigDecimal height;
    private BigDecimal weight;
    private BigDecimal bmi;
    private LocalDateTime createdAt;
}
