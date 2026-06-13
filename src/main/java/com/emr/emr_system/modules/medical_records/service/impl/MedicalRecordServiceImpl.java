package com.emr.emr_system.modules.medical_records.service.impl;

import com.emr.emr_system.modules.medical_records.dto.MedicalRecordConfidentialRequest;
import com.emr.emr_system.modules.medical_records.dto.MedicalRecordCreateRequest;
import com.emr.emr_system.modules.medical_records.dto.MedicalRecordResponse;
import com.emr.emr_system.modules.medical_records.dto.MedicalRecordUpdateRequest;
import com.emr.emr_system.modules.medical_records.entity.MedicalRecord;
import com.emr.emr_system.modules.medical_records.entity.RecordStatus;
import com.emr.emr_system.modules.medical_records.repository.MedicalRecordRepository;
import com.emr.emr_system.modules.medical_records.service.MedicalRecordService;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private static final int MAX_RECORD_NO_ATTEMPTS = 10;

    @Override
    public Page<MedicalRecordResponse> getMedicalRecords(UUID patientId,
                                                         UUID doctorId,
                                                         RecordStatus status,
                                                         LocalDate fromDate,
                                                         LocalDate toDate,
                                                         Pageable pageable) {
        if (fromDate != null && toDate != null && toDate.isBefore(fromDate)) {
            throw new IllegalArgumentException("toDate must be on or after fromDate");
        }

        LocalDateTime startTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime endTime = toDate != null
            ? toDate.plusDays(1).atStartOfDay().minusNanos(1)
            : null;

        Specification<MedicalRecord> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (patientId != null) {
                predicates.add(criteriaBuilder.equal(root.get("patientId"), patientId));
            }
            if (doctorId != null) {
                predicates.add(criteriaBuilder.equal(root.get("doctorId"), doctorId));
            }
            if (status == null) {
                predicates.add(criteriaBuilder.notEqual(root.get("status"), RecordStatus.ARCHIVED));
            } else {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (startTime != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("visitDate"), startTime));
            }
            if (endTime != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("visitDate"), endTime));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return medicalRecordRepository.findAll(specification, pageable).map(this::toResponse);
    }

    @Override
    public MedicalRecordResponse getMedicalRecordById(UUID id) {
        MedicalRecord record = getMedicalRecordOrThrow(id);
        return toResponse(record);
    }

    @Override
    public MedicalRecordResponse createMedicalRecord(MedicalRecordCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.getPatientId() == null || request.getDoctorId() == null
                || request.getVisitDate() == null || request.getChiefComplaint() == null) {
            throw new IllegalArgumentException("Missing required fields for medical record creation");
        }

        if (request.getAppointmentId() != null
                && medicalRecordRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new DuplicateResourceException("MedicalRecord", "appointmentId", request.getAppointmentId());
        }

        LocalDateTime now = LocalDateTime.now();
        MedicalRecord record = MedicalRecord.builder()
                .recordNo(generateRecordNo())
                .appointmentId(request.getAppointmentId())
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .departmentId(request.getDepartmentId())
                .visitDate(request.getVisitDate())
                .chiefComplaint(request.getChiefComplaint())
                .presentIllness(request.getPresentIllness())
                .assessment(request.getAssessment())
                .treatmentPlan(request.getTreatmentPlan())
                .status(RecordStatus.DRAFT)
                .isConfidential(Boolean.TRUE.equals(request.getIsConfidential()))
                .createdAt(now)
                .updatedAt(now)
                .build();

        MedicalRecord saved = medicalRecordRepository.save(record);
        return toResponse(saved);
    }

    @Override
    public MedicalRecordResponse updateMedicalRecord(UUID id, MedicalRecordUpdateRequest request) {
        MedicalRecord record = getMedicalRecordOrThrow(id);
        if (record.getStatus() != RecordStatus.DRAFT) {
            throw new IllegalStateException("Only draft medical records can be updated");
        }

        if (request.getVisitDate() != null) {
            record.setVisitDate(request.getVisitDate());
        }
        if (request.getChiefComplaint() != null) {
            record.setChiefComplaint(request.getChiefComplaint());
        }
        if (request.getPresentIllness() != null) {
            record.setPresentIllness(request.getPresentIllness());
        }
        if (request.getAssessment() != null) {
            record.setAssessment(request.getAssessment());
        }
        if (request.getTreatmentPlan() != null) {
            record.setTreatmentPlan(request.getTreatmentPlan());
        }

        record.setUpdatedAt(LocalDateTime.now());
        MedicalRecord saved = medicalRecordRepository.save(record);
        return toResponse(saved);
    }

    @Override
    public MedicalRecordResponse completeMedicalRecord(UUID id) {
        MedicalRecord record = getMedicalRecordOrThrow(id);
        if (record.getStatus() != RecordStatus.DRAFT) {
            throw new IllegalStateException("Only draft medical records can be completed");
        }

        record.setStatus(RecordStatus.COMPLETED);
        record.setUpdatedAt(LocalDateTime.now());
        MedicalRecord saved = medicalRecordRepository.save(record);
        return toResponse(saved);
    }

    @Override
    public MedicalRecordResponse archiveMedicalRecord(UUID id) {
        MedicalRecord record = getMedicalRecordOrThrow(id);
        if (record.getStatus() == RecordStatus.ARCHIVED) {
            throw new IllegalStateException("Medical record is already archived");
        }

        record.setStatus(RecordStatus.ARCHIVED);
        record.setUpdatedAt(LocalDateTime.now());
        MedicalRecord saved = medicalRecordRepository.save(record);
        return toResponse(saved);
    }

    @Override
    public void deleteMedicalRecord(UUID id) {
        MedicalRecord record = getMedicalRecordOrThrow(id);
        if (record.getStatus() != RecordStatus.DRAFT) {
            throw new IllegalStateException("Only draft medical records can be deleted");
        }

        record.setStatus(RecordStatus.ARCHIVED);
        record.setUpdatedAt(LocalDateTime.now());
        medicalRecordRepository.save(record);
    }

    @Override
    public MedicalRecordResponse setConfidential(UUID id, MedicalRecordConfidentialRequest request) {
        if (request == null || request.getIsConfidential() == null) {
            throw new IllegalArgumentException("isConfidential is required");
        }

        MedicalRecord record = getMedicalRecordOrThrow(id);
        record.setIsConfidential(request.getIsConfidential());
        record.setUpdatedAt(LocalDateTime.now());
        MedicalRecord saved = medicalRecordRepository.save(record);
        return toResponse(saved);
    }

    private MedicalRecord getMedicalRecordOrThrow(UUID id) {
        return medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", "id", id));
    }

    private MedicalRecordResponse toResponse(MedicalRecord record) {
        return MedicalRecordResponse.builder()
                .id(record.getId())
                .recordNo(record.getRecordNo())
                .appointmentId(record.getAppointmentId())
                .patientId(record.getPatientId())
                .doctorId(record.getDoctorId())
                .departmentId(record.getDepartmentId())
                .visitDate(record.getVisitDate())
                .chiefComplaint(record.getChiefComplaint())
                .presentIllness(record.getPresentIllness())
                .assessment(record.getAssessment())
                .treatmentPlan(record.getTreatmentPlan())
                .status(record.getStatus())
                .isConfidential(record.getIsConfidential())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }

    private String generateRecordNo() {
        int year = LocalDate.now().getYear();
        for (int attempt = 0; attempt < MAX_RECORD_NO_ATTEMPTS; attempt++) {
            int sequence = ThreadLocalRandom.current().nextInt(0, 1_000_000);
            String recordNo = String.format("BA-%d-%06d", year, sequence);
            if (!medicalRecordRepository.existsByRecordNo(recordNo)) {
                return recordNo;
            }
        }

        throw new IllegalStateException("Unable to generate a unique medical record number");
    }
}
