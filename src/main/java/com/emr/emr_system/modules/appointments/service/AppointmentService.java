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

public interface AppointmentService {
    Page<AppointmentResponse> getAppointments(Long doctorId,
                                              Long patientId,
                                              AppointmentStatus status,
                                              LocalDate date,
                                              Pageable pageable);

    AppointmentResponse getAppointmentById(Long id);

    AppointmentResponse createAppointment(AppointmentCreateRequest request);

    AppointmentResponse updateAppointment(Long id, AppointmentUpdateRequest request);

    AppointmentResponse confirmAppointment(Long id);

    AppointmentResponse startAppointment(Long id);

    AppointmentResponse completeAppointment(Long id);

    AppointmentResponse cancelAppointment(Long id, AppointmentCancelRequest request);

    AppointmentResponse markNoShow(Long id);

    void deleteAppointment(Long id);

    AvailableSlotsResponse getAvailableSlots(Long doctorId, LocalDate date);
}
