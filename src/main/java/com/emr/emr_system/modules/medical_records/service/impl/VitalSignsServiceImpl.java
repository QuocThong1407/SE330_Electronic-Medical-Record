package com.emr.emr_system.modules.medical_records.service.impl;

import com.emr.emr_system.modules.medical_records.dto.VitalSignsRequest;
import com.emr.emr_system.modules.medical_records.dto.VitalSignsResponse;
import com.emr.emr_system.modules.medical_records.entity.VitalSigns;
import com.emr.emr_system.modules.medical_records.repository.MedicalRecordRepository;
import com.emr.emr_system.modules.medical_records.repository.VitalSignsRepository;
import com.emr.emr_system.modules.medical_records.service.VitalSignsService;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VitalSignsServiceImpl implements VitalSignsService {
    private final VitalSignsRepository vitalSignsRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    @Override
    public VitalSignsResponse getVitalSigns(Long recordId) {
        if (!medicalRecordRepository.existsById(recordId)) {
            throw new ResourceNotFoundException("MedicalRecord", "id", recordId);
        }

        VitalSigns vitalSigns = vitalSignsRepository.findByMedicalRecordId(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("VitalSigns", "medicalRecordId", recordId));
        return toResponse(vitalSigns);
    }

    @Override
    public VitalSignsResponse createVitalSigns(Long recordId, VitalSignsRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (!medicalRecordRepository.existsById(recordId)) {
            throw new ResourceNotFoundException("MedicalRecord", "id", recordId);
        }
        if (vitalSignsRepository.findByMedicalRecordId(recordId).isPresent()) {
            throw new IllegalStateException("Vital signs already exist for this medical record");
        }

        BigDecimal bmi = resolveBmi(request.getBmi(), request.getHeight(), request.getWeight());

        VitalSigns vitalSigns = VitalSigns.builder()
                .medicalRecordId(recordId)
                .temperature(request.getTemperature())
                .heartRate(request.getHeartRate())
                .bloodPressure(request.getBloodPressure())
                .height(request.getHeight())
                .weight(request.getWeight())
                .bmi(bmi)
                .createdAt(LocalDateTime.now())
                .build();

        VitalSigns saved = vitalSignsRepository.save(vitalSigns);
        return toResponse(saved);
    }

    @Override
    public VitalSignsResponse updateVitalSigns(Long recordId, VitalSignsRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (!medicalRecordRepository.existsById(recordId)) {
            throw new ResourceNotFoundException("MedicalRecord", "id", recordId);
        }

        VitalSigns vitalSigns = vitalSignsRepository.findByMedicalRecordId(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("VitalSigns", "medicalRecordId", recordId));

        if (request.getTemperature() != null) {
            vitalSigns.setTemperature(request.getTemperature());
        }
        if (request.getHeartRate() != null) {
            vitalSigns.setHeartRate(request.getHeartRate());
        }
        if (request.getBloodPressure() != null) {
            vitalSigns.setBloodPressure(request.getBloodPressure());
        }
        if (request.getHeight() != null) {
            vitalSigns.setHeight(request.getHeight());
        }
        if (request.getWeight() != null) {
            vitalSigns.setWeight(request.getWeight());
        }

        BigDecimal bmi = request.getBmi();
        if (bmi == null) {
            bmi = resolveBmi(vitalSigns.getBmi(), vitalSigns.getHeight(), vitalSigns.getWeight());
        }
        vitalSigns.setBmi(bmi);

        VitalSigns saved = vitalSignsRepository.save(vitalSigns);
        return toResponse(saved);
    }

    private VitalSignsResponse toResponse(VitalSigns vitalSigns) {
        return VitalSignsResponse.builder()
                .id(vitalSigns.getId())
                .medicalRecordId(vitalSigns.getMedicalRecordId())
                .temperature(vitalSigns.getTemperature())
                .heartRate(vitalSigns.getHeartRate())
                .bloodPressure(vitalSigns.getBloodPressure())
                .height(vitalSigns.getHeight())
                .weight(vitalSigns.getWeight())
                .bmi(vitalSigns.getBmi())
                .createdAt(vitalSigns.getCreatedAt())
                .build();
    }

    private BigDecimal resolveBmi(BigDecimal currentBmi, BigDecimal heightCm, BigDecimal weightKg) {
        if (heightCm == null || weightKg == null) {
            return currentBmi;
        }

        if (heightCm.compareTo(BigDecimal.ZERO) <= 0) {
            return currentBmi;
        }

        BigDecimal heightMeters = heightCm.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
        BigDecimal denominator = heightMeters.multiply(heightMeters);
        if (denominator.compareTo(BigDecimal.ZERO) == 0) {
            return currentBmi;
        }

        return weightKg.divide(denominator, 1, RoundingMode.HALF_UP);
    }
}
