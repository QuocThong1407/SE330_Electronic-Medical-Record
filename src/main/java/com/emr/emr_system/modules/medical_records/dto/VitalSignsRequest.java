package com.emr.emr_system.modules.medical_records.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalSignsRequest {
    private BigDecimal temperature;
    private Integer heartRate;
    private Integer bloodPressure;
    private BigDecimal height;
    private BigDecimal weight;
    private BigDecimal bmi;
}
