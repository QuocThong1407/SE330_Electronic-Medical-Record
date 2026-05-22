package com.emr.emr_system.modules.medical_records.repository;

import com.emr.emr_system.modules.medical_records.entity.MedicalRecord;
import com.emr.emr_system.modules.medical_records.entity.RecordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, UUID> {
	@Query("""
			SELECT m
			FROM MedicalRecord m
			WHERE (:patientId IS NULL OR m.patientId = :patientId)
				AND (:doctorId IS NULL OR m.doctorId = :doctorId)
				AND ((:status IS NULL AND m.status <> com.emr.emr_system.modules.medical_records.entity.RecordStatus.ARCHIVED)
					OR (:status IS NOT NULL AND m.status = :status))
				AND (:startTime IS NULL OR m.visitDate >= :startTime)
				AND (:endTime IS NULL OR m.visitDate <= :endTime)
			""")
	Page<MedicalRecord> searchMedicalRecords(@Param("patientId") UUID patientId,
											 @Param("doctorId") UUID doctorId,
											 @Param("status") RecordStatus status,
											 @Param("startTime") LocalDateTime startTime,
											 @Param("endTime") LocalDateTime endTime,
											 Pageable pageable);

	boolean existsByRecordNo(String recordNo);

	boolean existsByAppointmentId(UUID appointmentId);
}
