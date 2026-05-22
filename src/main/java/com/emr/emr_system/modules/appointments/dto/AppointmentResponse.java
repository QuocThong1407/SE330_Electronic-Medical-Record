package com.emr.emr_system.modules.appointments.dto;

import com.emr.emr_system.modules.appointments.entity.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private String appointmentNo;
    private Long patientId;
    private Long doctorId;
    private Long departmentId;
    private LocalDateTime appointmentTime;
    private Integer durationMinutes;
    private AppointmentStatus status;
    private String reason;
    private String patientNotes;
    private String doctorNotes;
    private String cancelledReason;
    private Long cancelledBy;
    private LocalDateTime confirmedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
