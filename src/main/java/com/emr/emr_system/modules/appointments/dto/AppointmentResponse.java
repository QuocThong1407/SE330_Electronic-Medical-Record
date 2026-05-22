package com.emr.emr_system.modules.appointments.dto;

import com.emr.emr_system.modules.appointments.entity.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private UUID id;
    private String appointmentNo;
    private UUID patientId;
    private UUID doctorId;
    private UUID departmentId;
    private LocalDateTime appointmentTime;
    private Integer durationMinutes;
    private AppointmentStatus status;
    private String reason;
    private String patientNotes;
    private String doctorNotes;
    private String cancelledReason;
    private UUID cancelledBy;
    private LocalDateTime confirmedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
