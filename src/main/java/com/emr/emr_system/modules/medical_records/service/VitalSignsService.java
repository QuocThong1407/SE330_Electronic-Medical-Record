package com.emr.emr_system.modules.medical_records.service;

import com.emr.emr_system.modules.medical_records.dto.VitalSignsRequest;
import com.emr.emr_system.modules.medical_records.dto.VitalSignsResponse;

import java.util.UUID;

public interface VitalSignsService {
    VitalSignsResponse getVitalSigns(UUID recordId);

    VitalSignsResponse createVitalSigns(UUID recordId, VitalSignsRequest request);

    VitalSignsResponse updateVitalSigns(UUID recordId, VitalSignsRequest request);
}
