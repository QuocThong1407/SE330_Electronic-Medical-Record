package com.emr.emr_system.modules.appointments.repository;

import com.emr.emr_system.modules.appointments.entity.Appointment;
import com.emr.emr_system.modules.appointments.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
		@Query("""
				SELECT a
				FROM Appointment a
				WHERE (:doctorId IS NULL OR a.doctorId = :doctorId)
					AND (:patientId IS NULL OR a.patientId = :patientId)
					AND (:status IS NULL OR a.status = :status)
					AND (:startTime IS NULL OR :endTime IS NULL OR a.appointmentTime BETWEEN :startTime AND :endTime)
				""")
		Page<Appointment> searchAppointments(   @Param("doctorId") Long doctorId,
									            @Param("patientId") Long patientId,
												@Param("status") AppointmentStatus status,
												@Param("startTime") LocalDateTime startTime,
												@Param("endTime") LocalDateTime endTime,
												Pageable pageable);

		List<Appointment> findByDoctorIdAndAppointmentTimeBetweenAndStatusIn(   Long doctorId,
																			    LocalDateTime startTime,
																			    LocalDateTime endTime,
																			    Collection<AppointmentStatus> statuses);

		boolean existsByAppointmentNo(String appointmentNo);
}
