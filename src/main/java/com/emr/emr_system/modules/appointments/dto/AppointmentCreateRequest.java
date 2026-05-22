package com.emr.emr_system.modules.appointments.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentCreateRequest {
    private Long patientId;
    private Long doctorId;
    private Long departmentId;
    private LocalDateTime appointmentTime;
    private Integer durationMinutes;
    private String reason;
    private String patientNotes;
}
