package com.emr.emr_system.modules.prescription.service;

import com.emr.emr_system.modules.prescription.dto.PrescriptionCreateRequest;
import com.emr.emr_system.modules.prescription.dto.PrescriptionDetailResponse;
import com.emr.emr_system.modules.prescription.dto.PrescriptionItemResponse;
import com.emr.emr_system.modules.prescription.dto.PrescriptionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PrescriptionService {

    PrescriptionDetailResponse create(PrescriptionCreateRequest request);

    Page<PrescriptionResponse> search(UUID medicalRecordId,
            UUID patientId,
            UUID doctorId,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable);

    PrescriptionDetailResponse getById(UUID id);

    List<PrescriptionItemResponse> getItems(UUID prescriptionId);

    void delete(UUID id);
}