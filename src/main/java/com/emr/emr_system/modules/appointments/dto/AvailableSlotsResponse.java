package com.emr.emr_system.modules.appointments.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotsResponse {
    private UUID doctorId;
    private LocalDate date;
    private List<LocalDateTime> availableSlots;
}
