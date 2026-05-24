package com.emr.emr_system.modules.prescription.entity;

import com.emr.emr_system.shared.enums.FrequencyEnum;
import com.emr.emr_system.shared.enums.MedicineUnit;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "prescription_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItem {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "prescription_id", nullable = false)
    private UUID prescriptionId;

    @Column(name = "medicine_id")
    private UUID medicineId;

    @Column(name = "medicine_name", nullable = false, length = 200)
    private String medicineName;

    @Column(name = "dosage", nullable = false, length = 100)
    private String dosage;

    @Enumerated(EnumType.STRING)
    @Column(name = "frequency", length = 30)
    private FrequencyEnum frequency;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "unit", length = 20)
    private MedicineUnit unit;

    @Column(name = "route", length = 50)
    private String route;

    @Column(name = "instructions")
    private String instructions;

    @Column(name = "notes")
    private String notes;
}