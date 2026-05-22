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
public class AppointmentUpdateRequest {
    private LocalDateTime appointmentTime;
    private Integer durationMinutes;
    private String reason;
    private String patientNotes;
    private String doctorNotes;
}
