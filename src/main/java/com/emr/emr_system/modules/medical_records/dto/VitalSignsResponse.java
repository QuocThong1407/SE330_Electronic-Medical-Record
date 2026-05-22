package com.emr.emr_system.modules.medical_records.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalSignsResponse {
    private UUID id;
    private UUID medicalRecordId;
    private BigDecimal temperature;
    private Integer heartRate;
    private Integer bloodPressure;
    private BigDecimal height;
    private BigDecimal weight;
    private BigDecimal bmi;
    private LocalDateTime createdAt;
}
