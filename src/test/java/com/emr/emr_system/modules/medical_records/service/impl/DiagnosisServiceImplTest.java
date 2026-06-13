package com.emr.emr_system.modules.medical_records.service.impl;

import com.emr.emr_system.modules.icd_codes.repository.IcdCodeRepository;
import com.emr.emr_system.modules.medical_records.dto.DiagnosisCreateRequest;
import com.emr.emr_system.modules.medical_records.dto.DiagnosisResponse;
import com.emr.emr_system.modules.medical_records.entity.DiagnosisType;
import com.emr.emr_system.modules.medical_records.entity.MedicalRecord;
import com.emr.emr_system.modules.medical_records.entity.MedicalRecordDiagnosis;
import com.emr.emr_system.modules.medical_records.entity.MedicalRecordDiagnosisId;
import com.emr.emr_system.modules.medical_records.entity.RecordStatus;
import com.emr.emr_system.modules.medical_records.repository.MedicalRecordDiagnosisRepository;
import com.emr.emr_system.modules.medical_records.repository.MedicalRecordRepository;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DiagnosisServiceImplTest {

    @Mock
    private MedicalRecordDiagnosisRepository diagnosisRepository;

    @Mock
    private MedicalRecordRepository medicalRecordRepository;

    @Mock
    private IcdCodeRepository icdCodeRepository;

    @InjectMocks
    private DiagnosisServiceImpl diagnosisService;

    private UUID recordId;
    private MedicalRecord record;
    private MedicalRecordDiagnosis diagnosis;

    @BeforeEach
    void setUp() {
        recordId = UUID.randomUUID();
        record = MedicalRecord.builder()
                .id(recordId)
                .status(RecordStatus.DRAFT)
                .build();

        diagnosis = MedicalRecordDiagnosis.builder()
                .medicalRecordId(recordId)
                .icdCodeId("J01.90")
                .diagnosisType(DiagnosisType.PRIMARY)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // --- getDiagnoses ---

    @Test
    void getDiagnoses_Success() {
        when(medicalRecordRepository.existsById(recordId)).thenReturn(true);
        when(diagnosisRepository.findByMedicalRecordId(recordId)).thenReturn(List.of(diagnosis));

        List<DiagnosisResponse> responses = diagnosisService.getDiagnoses(recordId);

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("J01.90", responses.get(0).getIcdCodeId());
    }

    @Test
    void getDiagnoses_RecordNotFound_ThrowsException() {
        when(medicalRecordRepository.existsById(recordId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> diagnosisService.getDiagnoses(recordId));
    }

    // --- addDiagnosis ---

    @Test
    void addDiagnosis_WithIcdCode_Success() {
        DiagnosisCreateRequest request = new DiagnosisCreateRequest();
        request.setIcdCodeId("J01.90");

        when(medicalRecordRepository.findById(recordId)).thenReturn(Optional.of(record));
        when(icdCodeRepository.existsById("J01.90")).thenReturn(true);
        when(diagnosisRepository.save(any(MedicalRecordDiagnosis.class))).thenReturn(diagnosis);

        DiagnosisResponse response = diagnosisService.addDiagnosis(recordId, request);

        assertNotNull(response);
        assertEquals("J01.90", response.getIcdCodeId());
    }

    @Test
    void addDiagnosis_WithCustomDiagnosis_Success() {
        DiagnosisCreateRequest request = new DiagnosisCreateRequest();
        request.setCustomDiagnosis("Unknown disease");

        MedicalRecordDiagnosis customDiagnosis = MedicalRecordDiagnosis.builder()
                .medicalRecordId(recordId)
                .icdCodeId("CUST000001")
                .customDiagnosis("Unknown disease")
                .diagnosisType(DiagnosisType.PRIMARY)
                .createdAt(LocalDateTime.now())
                .build();

        when(medicalRecordRepository.findById(recordId)).thenReturn(Optional.of(record));
        when(diagnosisRepository.existsById(any(MedicalRecordDiagnosisId.class))).thenReturn(false);
        when(diagnosisRepository.save(any(MedicalRecordDiagnosis.class))).thenReturn(customDiagnosis);

        DiagnosisResponse response = diagnosisService.addDiagnosis(recordId, request);

        assertNotNull(response);
        assertEquals("CUST000001", response.getIcdCodeId());
        assertEquals("Unknown disease", response.getCustomDiagnosis());
    }

    @Test
    void addDiagnosis_MissingBoth_ThrowsException() {
        DiagnosisCreateRequest request = new DiagnosisCreateRequest();

        when(medicalRecordRepository.findById(recordId)).thenReturn(Optional.of(record));

        assertThrows(IllegalArgumentException.class, () -> diagnosisService.addDiagnosis(recordId, request));
    }

    @Test
    void addDiagnosis_InvalidIcdCode_ThrowsException() {
        DiagnosisCreateRequest request = new DiagnosisCreateRequest();
        request.setIcdCodeId("INVALID");

        when(medicalRecordRepository.findById(recordId)).thenReturn(Optional.of(record));
        when(icdCodeRepository.existsById("INVALID")).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> diagnosisService.addDiagnosis(recordId, request));
    }

    // --- deleteDiagnosis ---

    @Test
    void deleteDiagnosis_Success() {
        when(medicalRecordRepository.findById(recordId)).thenReturn(Optional.of(record));
        when(diagnosisRepository.findById(new MedicalRecordDiagnosisId(recordId, "J01.90"))).thenReturn(Optional.of(diagnosis));

        assertDoesNotThrow(() -> diagnosisService.deleteDiagnosis(recordId, "J01.90"));
        verify(diagnosisRepository, times(1)).delete(diagnosis);
    }

    @Test
    void deleteDiagnosis_NotDraft_ThrowsException() {
        record.setStatus(RecordStatus.COMPLETED);

        when(medicalRecordRepository.findById(recordId)).thenReturn(Optional.of(record));

        assertThrows(IllegalStateException.class, () -> diagnosisService.deleteDiagnosis(recordId, "J01.90"));
    }

    @Test
    void deleteDiagnosis_NotFound_ThrowsException() {
        when(medicalRecordRepository.findById(recordId)).thenReturn(Optional.of(record));
        when(diagnosisRepository.findById(new MedicalRecordDiagnosisId(recordId, "J01.90"))).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> diagnosisService.deleteDiagnosis(recordId, "J01.90"));
    }
}
