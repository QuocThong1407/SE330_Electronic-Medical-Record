package com.emr.emr_system.modules.appointments.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotsResponse {
    private UUID doctorId;
    private LocalDate date;
    private List<String> availableSlots;
    
    public static AvailableSlotsResponse fromTimeSlots(UUID doctorId, LocalDate date, List<LocalDateTime> timeSlots) {
        return AvailableSlotsResponse.builder()
                .doctorId(doctorId)
                .date(date)
                .availableSlots(timeSlots.stream()
                        .map(LocalDateTime::toLocalTime)
                        .map(LocalTime::toString)
                        .collect(Collectors.toList()))
                .build();
    }
}
