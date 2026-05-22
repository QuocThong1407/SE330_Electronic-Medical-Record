package com.emr.emr_system.modules.appointments.service;

import com.emr.emr_system.modules.appointments.dto.AppointmentCancelRequest;
import com.emr.emr_system.modules.appointments.dto.AppointmentCreateRequest;
import com.emr.emr_system.modules.appointments.dto.AppointmentResponse;
import com.emr.emr_system.modules.appointments.dto.AppointmentUpdateRequest;
import com.emr.emr_system.modules.appointments.dto.AvailableSlotsResponse;
import com.emr.emr_system.modules.appointments.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface AppointmentService {
    Page<AppointmentResponse> getAppointments(UUID doctorId,
                                              UUID patientId,
                                              AppointmentStatus status,
                                              LocalDate date,
                                              Pageable pageable);

    AppointmentResponse getAppointmentById(UUID id);

    AppointmentResponse createAppointment(AppointmentCreateRequest request);

    AppointmentResponse updateAppointment(UUID id, AppointmentUpdateRequest request);

    AppointmentResponse confirmAppointment(UUID id);

    AppointmentResponse startAppointment(UUID id);

    AppointmentResponse completeAppointment(UUID id);

    AppointmentResponse cancelAppointment(UUID id, AppointmentCancelRequest request);

    AppointmentResponse markNoShow(UUID id);

    void deleteAppointment(UUID id);

    AvailableSlotsResponse getAvailableSlots(UUID doctorId, LocalDate date);
}
