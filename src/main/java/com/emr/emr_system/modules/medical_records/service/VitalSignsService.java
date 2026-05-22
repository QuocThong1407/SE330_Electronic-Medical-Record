package com.emr.emr_system.modules.medical_records.service;

import com.emr.emr_system.modules.medical_records.dto.VitalSignsRequest;
import com.emr.emr_system.modules.medical_records.dto.VitalSignsResponse;

public interface VitalSignsService {
    VitalSignsResponse getVitalSigns(Long recordId);

    VitalSignsResponse createVitalSigns(Long recordId, VitalSignsRequest request);

    VitalSignsResponse updateVitalSigns(Long recordId, VitalSignsRequest request);
}
