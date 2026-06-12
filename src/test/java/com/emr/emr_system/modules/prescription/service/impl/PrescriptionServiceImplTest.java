package com.emr.emr_system.modules.prescription.service.impl;

import com.emr.emr_system.modules.doctor.repository.DoctorProfileRepository;
import com.emr.emr_system.modules.medical_records.repository.MedicalRecordRepository;
import com.emr.emr_system.modules.medicine.entity.Medicine;
import com.emr.emr_system.modules.medicine.repository.MedicineRepository;
import com.emr.emr_system.modules.patient.repository.PatientProfileRepository;
import com.emr.emr_system.modules.prescription.dto.PrescriptionCreateRequest;
import com.emr.emr_system.modules.prescription.dto.PrescriptionDetailResponse;
import com.emr.emr_system.modules.prescription.dto.PrescriptionItemRequest;
import com.emr.emr_system.modules.prescription.entity.Prescription;
import com.emr.emr_system.modules.prescription.entity.PrescriptionItem;
import com.emr.emr_system.modules.prescription.repository.PrescriptionItemRepository;
import com.emr.emr_system.modules.prescription.repository.PrescriptionRepository;
import com.emr.emr_system.shared.exceptions.BadRequestException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PrescriptionServiceImplTest {

    @Mock
    private PrescriptionRepository prescriptionRepository;
    @Mock
    private PrescriptionItemRepository prescriptionItemRepository;
    @Mock
    private MedicalRecordRepository medicalRecordRepository;
    @Mock
    private PatientProfileRepository patientProfileRepository;
    @Mock
    private DoctorProfileRepository doctorProfileRepository;
    @Mock
    private MedicineRepository medicineRepository;

    @InjectMocks
    private PrescriptionServiceImpl prescriptionService;

    private UUID prescriptionId;
    private UUID medicalRecordId;
    private UUID patientId;
    private UUID doctorId;
    private UUID medicineId;
    private Medicine medicine;
    private Prescription prescription;

    @BeforeEach
    void setUp() {
        prescriptionId = UUID.randomUUID();
        medicalRecordId = UUID.randomUUID();
        patientId = UUID.randomUUID();
        doctorId = UUID.randomUUID();
        medicineId = UUID.randomUUID();

        medicine = Medicine.builder()
                .id(medicineId)
                .name("Paracetamol")
                .stockQuantity(100)
                .isActive(true)
                .build();

        prescription = Prescription.builder()
                .id(prescriptionId)
                .prescriptionNo("DT-2026-123456")
                .medicalRecordId(medicalRecordId)
                .patientId(patientId)
                .doctorId(doctorId)
                .prescribedDate(LocalDate.now())
                .build();
    }

    @Test
    void create_Success() {
        PrescriptionItemRequest itemReq = new PrescriptionItemRequest();
        itemReq.setMedicineId(medicineId);
        itemReq.setMedicineName("Paracetamol");
        itemReq.setQuantity(10);

        PrescriptionCreateRequest request = new PrescriptionCreateRequest();
        request.setMedicalRecordId(medicalRecordId);
        request.setPatientId(patientId);
        request.setDoctorId(doctorId);
        request.setPrescribedDate(LocalDate.now());
        request.setItems(List.of(itemReq));

        when(medicalRecordRepository.existsById(medicalRecordId)).thenReturn(true);
        when(patientProfileRepository.existsById(patientId)).thenReturn(true);
        when(doctorProfileRepository.existsById(doctorId)).thenReturn(true);
        when(medicineRepository.findById(medicineId)).thenReturn(Optional.of(medicine));
        when(prescriptionRepository.existsByPrescriptionNo(anyString())).thenReturn(false);
        when(prescriptionRepository.save(any(Prescription.class))).thenReturn(prescription);
        when(prescriptionItemRepository.saveAll(anyList())).thenReturn(List.of(new PrescriptionItem()));

        PrescriptionDetailResponse response = prescriptionService.create(request);

        assertNotNull(response);
        assertEquals(90, medicine.getStockQuantity());
        verify(medicineRepository, times(1)).save(medicine);
        verify(prescriptionRepository, times(1)).save(any(Prescription.class));
        verify(prescriptionItemRepository, times(1)).saveAll(anyList());
    }

    @Test
    void create_InsufficientStock_ThrowsException() {
        PrescriptionItemRequest itemReq = new PrescriptionItemRequest();
        itemReq.setMedicineId(medicineId);
        itemReq.setQuantity(200);

        PrescriptionCreateRequest request = new PrescriptionCreateRequest();
        request.setMedicalRecordId(medicalRecordId);
        request.setPatientId(patientId);
        request.setDoctorId(doctorId);
        request.setItems(List.of(itemReq));

        when(medicalRecordRepository.existsById(medicalRecordId)).thenReturn(true);
        when(patientProfileRepository.existsById(patientId)).thenReturn(true);
        when(doctorProfileRepository.existsById(doctorId)).thenReturn(true);
        when(medicineRepository.findById(medicineId)).thenReturn(Optional.of(medicine));

        assertThrows(BadRequestException.class, () -> prescriptionService.create(request));
    }

    @Test
    void create_InactiveMedicine_ThrowsException() {
        medicine.setIsActive(false);

        PrescriptionItemRequest itemReq = new PrescriptionItemRequest();
        itemReq.setMedicineId(medicineId);
        itemReq.setQuantity(10);

        PrescriptionCreateRequest request = new PrescriptionCreateRequest();
        request.setMedicalRecordId(medicalRecordId);
        request.setPatientId(patientId);
        request.setDoctorId(doctorId);
        request.setItems(List.of(itemReq));

        when(medicalRecordRepository.existsById(medicalRecordId)).thenReturn(true);
        when(patientProfileRepository.existsById(patientId)).thenReturn(true);
        when(doctorProfileRepository.existsById(doctorId)).thenReturn(true);
        when(medicineRepository.findById(medicineId)).thenReturn(Optional.of(medicine));

        assertThrows(BadRequestException.class, () -> prescriptionService.create(request));
    }

    @Test
    void getById_Success() {
        when(prescriptionRepository.findById(prescriptionId)).thenReturn(Optional.of(prescription));
        when(prescriptionItemRepository.findByPrescriptionId(prescriptionId)).thenReturn(List.of(new PrescriptionItem()));

        PrescriptionDetailResponse response = prescriptionService.getById(prescriptionId);

        assertNotNull(response);
        assertEquals(prescriptionId, response.getId());
    }

    @Test
    void getById_NotFound_ThrowsException() {
        when(prescriptionRepository.findById(prescriptionId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> prescriptionService.getById(prescriptionId));
    }

    @Test
    void delete_Success() {
        when(prescriptionRepository.findById(prescriptionId)).thenReturn(Optional.of(prescription));

        assertDoesNotThrow(() -> prescriptionService.delete(prescriptionId));
        verify(prescriptionItemRepository, times(1)).deleteByPrescriptionId(prescriptionId);
        verify(prescriptionRepository, times(1)).delete(prescription);
    }
}
