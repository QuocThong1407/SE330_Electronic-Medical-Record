package com.emr.emr_system.modules.medical_records.service.impl;

import com.emr.emr_system.modules.medical_records.dto.MedicalRecordConfidentialRequest;
import com.emr.emr_system.modules.medical_records.dto.MedicalRecordCreateRequest;
import com.emr.emr_system.modules.medical_records.dto.MedicalRecordResponse;
import com.emr.emr_system.modules.medical_records.dto.MedicalRecordUpdateRequest;
import com.emr.emr_system.modules.medical_records.entity.MedicalRecord;
import com.emr.emr_system.modules.medical_records.entity.RecordStatus;
import com.emr.emr_system.modules.medical_records.repository.MedicalRecordRepository;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MedicalRecordServiceImplTest {

    @Mock
    private MedicalRecordRepository medicalRecordRepository;

    @InjectMocks
    private MedicalRecordServiceImpl medicalRecordService;

    private UUID recordId;
    private UUID patientId;
    private UUID doctorId;
    private UUID appointmentId;
    private MedicalRecord record;

    @BeforeEach
    void setUp() {
        recordId = UUID.randomUUID();
        patientId = UUID.randomUUID();
        doctorId = UUID.randomUUID();
        appointmentId = UUID.randomUUID();

        record = MedicalRecord.builder()
                .id(recordId)
                .recordNo("BA-2026-123456")
                .patientId(patientId)
                .doctorId(doctorId)
                .appointmentId(appointmentId)
                .visitDate(LocalDateTime.now())
                .chiefComplaint("Headache")
                .status(RecordStatus.DRAFT)
                .build();
    }

    @Test
    void createMedicalRecord_Success() {
        MedicalRecordCreateRequest request = new MedicalRecordCreateRequest();
        request.setPatientId(patientId);
        request.setDoctorId(doctorId);
        request.setAppointmentId(appointmentId);
        request.setVisitDate(LocalDateTime.now());
        request.setChiefComplaint("Headache");

        when(medicalRecordRepository.existsByAppointmentId(appointmentId)).thenReturn(false);
        when(medicalRecordRepository.existsByRecordNo(anyString())).thenReturn(false);
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenReturn(record);

        MedicalRecordResponse response = medicalRecordService.createMedicalRecord(request);

        assertNotNull(response);
        assertEquals("Headache", response.getChiefComplaint());
        verify(medicalRecordRepository, times(1)).save(any(MedicalRecord.class));
    }

    @Test
    void createMedicalRecord_DuplicateAppointment_ThrowsException() {
        MedicalRecordCreateRequest request = new MedicalRecordCreateRequest();
        request.setPatientId(patientId);
        request.setDoctorId(doctorId);
        request.setAppointmentId(appointmentId);
        request.setVisitDate(LocalDateTime.now());
        request.setChiefComplaint("Headache");

        when(medicalRecordRepository.existsByAppointmentId(appointmentId)).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> medicalRecordService.createMedicalRecord(request));
    }

    @Test
    void getMedicalRecords_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<MedicalRecord> page = new PageImpl<>(List.of(record));

        when(medicalRecordRepository.searchMedicalRecords(eq(patientId), eq(doctorId), eq(RecordStatus.DRAFT), any(), any(), eq(pageable))).thenReturn(page);

        Page<MedicalRecordResponse> result = medicalRecordService.getMedicalRecords(patientId, doctorId, RecordStatus.DRAFT, null, null, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("BA-2026-123456", result.getContent().get(0).getRecordNo());
    }

    @Test
    void updateMedicalRecord_Success() {
        MedicalRecordUpdateRequest request = new MedicalRecordUpdateRequest();
        request.setChiefComplaint("Severe Headache");

        when(medicalRecordRepository.findById(recordId)).thenReturn(Optional.of(record));
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenReturn(record);

        MedicalRecordResponse response = medicalRecordService.updateMedicalRecord(recordId, request);

        assertNotNull(response);
        assertEquals("Severe Headache", record.getChiefComplaint());
    }

    @Test
    void updateMedicalRecord_NotDraft_ThrowsException() {
        record.setStatus(RecordStatus.COMPLETED);
        MedicalRecordUpdateRequest request = new MedicalRecordUpdateRequest();

        when(medicalRecordRepository.findById(recordId)).thenReturn(Optional.of(record));

        assertThrows(IllegalStateException.class, () -> medicalRecordService.updateMedicalRecord(recordId, request));
    }

    @Test
    void completeMedicalRecord_Success() {
        when(medicalRecordRepository.findById(recordId)).thenReturn(Optional.of(record));
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenReturn(record);

        MedicalRecordResponse response = medicalRecordService.completeMedicalRecord(recordId);

        assertNotNull(response);
        assertEquals(RecordStatus.COMPLETED, record.getStatus());
    }

    @Test
    void archiveMedicalRecord_Success() {
        when(medicalRecordRepository.findById(recordId)).thenReturn(Optional.of(record));
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenReturn(record);

        MedicalRecordResponse response = medicalRecordService.archiveMedicalRecord(recordId);

        assertNotNull(response);
        assertEquals(RecordStatus.ARCHIVED, record.getStatus());
    }

    @Test
    void deleteMedicalRecord_Success() {
        when(medicalRecordRepository.findById(recordId)).thenReturn(Optional.of(record));
        
        assertDoesNotThrow(() -> medicalRecordService.deleteMedicalRecord(recordId));
        assertEquals(RecordStatus.ARCHIVED, record.getStatus());
        verify(medicalRecordRepository, times(1)).save(record);
    }

    @Test
    void deleteMedicalRecord_NotDraft_ThrowsException() {
        record.setStatus(RecordStatus.COMPLETED);
        when(medicalRecordRepository.findById(recordId)).thenReturn(Optional.of(record));

        assertThrows(IllegalStateException.class, () -> medicalRecordService.deleteMedicalRecord(recordId));
    }
}
