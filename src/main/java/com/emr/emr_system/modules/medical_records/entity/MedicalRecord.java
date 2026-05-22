package com.emr.emr_system.modules.medical_records.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medical_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecord {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "record_no", nullable = false, unique = true, length = 30)
    private String recordNo;

    @Column(name = "appointment_id", unique = true)
    private UUID appointmentId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "visit_date", nullable = false)
    private LocalDateTime visitDate;

    @Column(name = "chief_complaint", nullable = false)
    private String chiefComplaint;

    @Column(name = "present_illness")
    private String presentIllness;

    @Column(name = "assessment")
    private String assessment;

    @Column(name = "treatment_plan")
    private String treatmentPlan;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RecordStatus status;

    @Column(name = "is_confidential", nullable = false)
    private Boolean isConfidential;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
