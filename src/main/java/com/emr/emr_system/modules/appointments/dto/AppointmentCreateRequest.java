package com.emr.emr_system.modules.appointments.dto;

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
public class AppointmentCreateRequest {
    private UUID patientId;
    private UUID doctorId;
    private UUID departmentId;
    private LocalDateTime appointmentTime;
    private Integer durationMinutes;
    private String reason;
    private String patientNotes;
}
