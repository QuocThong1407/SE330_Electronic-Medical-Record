package com.emr.emr_system.modules.prescription.service.impl;

import com.emr.emr_system.modules.doctor.repository.DoctorProfileRepository;
import com.emr.emr_system.modules.medicine.entity.Medicine;
import com.emr.emr_system.modules.medicine.repository.MedicineRepository;
import com.emr.emr_system.modules.medical_records.repository.MedicalRecordRepository;
import com.emr.emr_system.modules.patient.repository.PatientProfileRepository;
import com.emr.emr_system.modules.prescription.dto.PrescriptionCreateRequest;
import com.emr.emr_system.modules.prescription.dto.PrescriptionDetailResponse;
import com.emr.emr_system.modules.prescription.dto.PrescriptionItemRequest;
import com.emr.emr_system.modules.prescription.dto.PrescriptionItemResponse;
import com.emr.emr_system.modules.prescription.dto.PrescriptionResponse;
import com.emr.emr_system.modules.prescription.entity.Prescription;
import com.emr.emr_system.modules.prescription.entity.PrescriptionItem;
import com.emr.emr_system.modules.prescription.repository.PrescriptionItemRepository;
import com.emr.emr_system.modules.prescription.repository.PrescriptionRepository;
import com.emr.emr_system.modules.prescription.service.PrescriptionService;
import com.emr.emr_system.shared.exceptions.BadRequestException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final MedicineRepository medicineRepository;

    private static final int MAX_PRESCRIPTION_NO_ATTEMPTS = 10;

    @Override
    public PrescriptionDetailResponse create(PrescriptionCreateRequest request) {
        if (!medicalRecordRepository.existsById(request.getMedicalRecordId())) {
            throw new ResourceNotFoundException("MedicalRecord", "id", request.getMedicalRecordId());
        }
        if (!patientProfileRepository.existsById(request.getPatientId())) {
            throw new ResourceNotFoundException("Patient", "id", request.getPatientId());
        }
        if (!doctorProfileRepository.existsById(request.getDoctorId())) {
            throw new ResourceNotFoundException("Doctor", "id", request.getDoctorId());
        }

        List<Medicine> medicinesToSave = new ArrayList<>();
        for (PrescriptionItemRequest itemReq : request.getItems()) {
            if (itemReq.getMedicineId() != null) {
                Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                        .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", itemReq.getMedicineId()));
                if (!Boolean.TRUE.equals(medicine.getIsActive())) {
                    throw new BadRequestException("Medicine is inactive: " + itemReq.getMedicineName());
                }
                int newStock = medicine.getStockQuantity() - itemReq.getQuantity();
                if (newStock < 0) {
                    throw new BadRequestException("Insufficient stock for: " + itemReq.getMedicineName());
                }
                medicine.setStockQuantity(newStock);
                medicinesToSave.add(medicine);
            }
        }

        medicinesToSave.forEach(medicineRepository::save);

        LocalDateTime now = LocalDateTime.now();
        Prescription prescription = Prescription.builder()
                .prescriptionNo(generatePrescriptionNo())
                .medicalRecordId(request.getMedicalRecordId())
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .prescribedDate(request.getPrescribedDate())
                .notes(request.getNotes())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Prescription saved = prescriptionRepository.save(prescription);

        List<PrescriptionItem> items = request.getItems().stream()
                .map(itemReq -> PrescriptionItem.builder()
                        .prescriptionId(saved.getId())
                        .medicineId(itemReq.getMedicineId())
                        .medicineName(itemReq.getMedicineName())
                        .dosage(itemReq.getDosage())
                        .frequency(itemReq.getFrequency())
                        .durationDays(itemReq.getDurationDays())
                        .quantity(itemReq.getQuantity())
                        .unit(itemReq.getUnit())
                        .route(itemReq.getRoute())
                        .instructions(itemReq.getInstructions())
                        .notes(itemReq.getNotes())
                        .build())
                .toList();

        List<PrescriptionItem> savedItems = prescriptionItemRepository.saveAll(items);
        return PrescriptionDetailResponse.from(saved, savedItems);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PrescriptionResponse> search(UUID medicalRecordId,
            UUID patientId,
            UUID doctorId,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable) {
        return prescriptionRepository
                .searchPrescriptions(medicalRecordId, patientId, doctorId, fromDate, toDate, pageable)
                .map(p -> {
                    int count = prescriptionItemRepository.findByPrescriptionId(p.getId()).size();
                    return PrescriptionResponse.from(p, count);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public PrescriptionDetailResponse getById(UUID id) {
        Prescription prescription = getPrescriptionOrThrow(id);
        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(id);
        return PrescriptionDetailResponse.from(prescription, items);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionItemResponse> getItems(UUID prescriptionId) {
        if (!prescriptionRepository.existsById(prescriptionId)) {
            throw new ResourceNotFoundException("Prescription", "id", prescriptionId);
        }
        return prescriptionItemRepository.findByPrescriptionId(prescriptionId)
                .stream()
                .map(PrescriptionItemResponse::from)
                .toList();
    }

    @Override
    public void delete(UUID id) {
        Prescription prescription = getPrescriptionOrThrow(id);
        prescriptionItemRepository.deleteByPrescriptionId(prescription.getId());
        prescriptionRepository.delete(prescription);
    }

    private Prescription getPrescriptionOrThrow(UUID id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", id));
    }

    private String generatePrescriptionNo() {
        int year = LocalDate.now().getYear();
        for (int attempt = 0; attempt < MAX_PRESCRIPTION_NO_ATTEMPTS; attempt++) {
            int sequence = ThreadLocalRandom.current().nextInt(0, 1_000_000);
            String prescriptionNo = String.format("DT-%d-%06d", year, sequence);
            if (!prescriptionRepository.existsByPrescriptionNo(prescriptionNo)) {
                return prescriptionNo;
            }
        }
        throw new IllegalStateException("Unable to generate a unique prescription number");
    }
}