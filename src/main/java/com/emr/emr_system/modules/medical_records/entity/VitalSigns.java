package com.emr.emr_system.modules.medical_records.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vital_signs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalSigns {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "medical_record_id", nullable = false, unique = true)
    private UUID medicalRecordId;

    @Column(name = "temperature")
    private BigDecimal temperature;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "blood_pressure")
    private Integer bloodPressure;

    @Column(name = "height")
    private BigDecimal height;

    @Column(name = "weight")
    private BigDecimal weight;

    @Column(name = "bmi")
    private BigDecimal bmi;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
