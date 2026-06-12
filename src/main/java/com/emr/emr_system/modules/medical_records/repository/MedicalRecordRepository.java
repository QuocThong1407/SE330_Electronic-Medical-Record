package com.emr.emr_system.modules.medical_records.repository;

import com.emr.emr_system.modules.medical_records.entity.MedicalRecord;
import com.emr.emr_system.modules.medical_records.entity.RecordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, UUID>, JpaSpecificationExecutor<MedicalRecord> {

	boolean existsByRecordNo(String recordNo);

	boolean existsByAppointmentId(UUID appointmentId);
}
