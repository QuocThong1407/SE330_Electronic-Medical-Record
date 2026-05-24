package com.emr.emr_system.modules.prescription.repository;

import com.emr.emr_system.modules.prescription.entity.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, UUID> {

    List<PrescriptionItem> findByPrescriptionId(UUID prescriptionId);

    void deleteByPrescriptionId(UUID prescriptionId);
}