package com.emr.emr_system.modules.medical_records.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordDiagnosisId implements Serializable {
    private Long medicalRecordId;
    private String icdCodeId;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        MedicalRecordDiagnosisId that = (MedicalRecordDiagnosisId) o;
        return Objects.equals(medicalRecordId, that.medicalRecordId)
                && Objects.equals(icdCodeId, that.icdCodeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(medicalRecordId, icdCodeId);
    }
}
