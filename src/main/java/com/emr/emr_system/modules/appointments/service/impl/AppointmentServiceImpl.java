package com.emr.emr_system.modules.appointments.service.impl;

import com.emr.emr_system.modules.appointments.dto.AppointmentCancelRequest;
import com.emr.emr_system.modules.appointments.dto.AppointmentCreateRequest;
import com.emr.emr_system.modules.appointments.dto.AppointmentResponse;
import com.emr.emr_system.modules.appointments.dto.AppointmentUpdateRequest;
import com.emr.emr_system.modules.appointments.dto.AvailableSlotsResponse;
import com.emr.emr_system.modules.appointments.entity.Appointment;
import com.emr.emr_system.modules.appointments.entity.AppointmentStatus;
import com.emr.emr_system.modules.appointments.repository.AppointmentRepository;
import com.emr.emr_system.modules.appointments.service.AppointmentService;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private static final List<AppointmentStatus> ACTIVE_STATUSES = List.of(
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.IN_PROGRESS
    );
    private static final int SLOT_MINUTES = 30;
    private static final LocalTime CLINIC_OPEN_TIME = LocalTime.of(8, 0);
    private static final LocalTime CLINIC_CLOSE_TIME = LocalTime.of(17, 0);
    private static final int MAX_APPOINTMENT_NO_ATTEMPTS = 10;

    @Override
    public Page<AppointmentResponse> getAppointments(Long doctorId,
                                                     Long patientId,
                                                     AppointmentStatus status,
                                                     LocalDate date,
                                                     Pageable pageable) {
        LocalDateTime startTime = null;
        LocalDateTime endTime = null;
        if (date != null) {
            startTime = date.atStartOfDay();
            endTime = date.plusDays(1).atStartOfDay().minusNanos(1);
        }

        return appointmentRepository
                .searchAppointments(doctorId, patientId, status, startTime, endTime, pageable)
                .map(this::toResponse);
    }

    @Override
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = getAppointmentOrThrow(id);
        return toResponse(appointment);
    }

    @Override
    public AppointmentResponse createAppointment(AppointmentCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.getDoctorId() == null || request.getPatientId() == null
                || request.getAppointmentTime() == null || request.getDurationMinutes() == null) {
            throw new IllegalArgumentException("Missing required fields for appointment creation");
        }

        validateNoOverlap(request.getDoctorId(), request.getAppointmentTime(), request.getDurationMinutes(), null);

        LocalDateTime now = LocalDateTime.now();
        Appointment appointment = Appointment.builder()
                .appointmentNo(generateAppointmentNo())
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .departmentId(request.getDepartmentId())
                .appointmentTime(request.getAppointmentTime())
                .durationMinutes(request.getDurationMinutes())
                .status(AppointmentStatus.PENDING)
                .reason(request.getReason())
                .patientNotes(request.getPatientNotes())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        return toResponse(saved);
    }

    @Override
    public AppointmentResponse updateAppointment(Long id, AppointmentUpdateRequest request) {
        Appointment appointment = getAppointmentOrThrow(id);
        if (!(appointment.getStatus() == AppointmentStatus.PENDING
                || appointment.getStatus() == AppointmentStatus.CONFIRMED)) {
            throw new IllegalStateException("Only pending or confirmed appointments can be updated");
        }

        LocalDateTime newTime = request.getAppointmentTime() != null
                ? request.getAppointmentTime()
                : appointment.getAppointmentTime();
        Integer newDuration = request.getDurationMinutes() != null
                ? request.getDurationMinutes()
                : appointment.getDurationMinutes();

        if (request.getAppointmentTime() != null || request.getDurationMinutes() != null) {
            validateNoOverlap(appointment.getDoctorId(), newTime, newDuration, appointment.getId());
            appointment.setAppointmentTime(newTime);
            appointment.setDurationMinutes(newDuration);
        }

        if (request.getReason() != null) {
            appointment.setReason(request.getReason());
        }
        if (request.getPatientNotes() != null) {
            appointment.setPatientNotes(request.getPatientNotes());
        }
        if (request.getDoctorNotes() != null) {
            appointment.setDoctorNotes(request.getDoctorNotes());
        }

        appointment.setUpdatedAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appointment);
        return toResponse(saved);
    }

    @Override
    public AppointmentResponse confirmAppointment(Long id) {
        Appointment appointment = getAppointmentOrThrow(id);
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new IllegalStateException("Only pending appointments can be confirmed");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setConfirmedAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appointment);
        return toResponse(saved);
    }

    @Override
    public AppointmentResponse startAppointment(Long id) {
        Appointment appointment = getAppointmentOrThrow(id);
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed appointments can be started");
        }

        appointment.setStatus(AppointmentStatus.IN_PROGRESS);
        appointment.setUpdatedAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appointment);
        return toResponse(saved);
    }

    @Override
    public AppointmentResponse completeAppointment(Long id) {
        Appointment appointment = getAppointmentOrThrow(id);
        if (appointment.getStatus() != AppointmentStatus.IN_PROGRESS) {
            throw new IllegalStateException("Only in-progress appointments can be completed");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setUpdatedAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appointment);
        return toResponse(saved);
    }

    @Override
    public AppointmentResponse cancelAppointment(Long id, AppointmentCancelRequest request) {
        Appointment appointment = getAppointmentOrThrow(id);
        if (appointment.getStatus() == AppointmentStatus.COMPLETED
                || appointment.getStatus() == AppointmentStatus.CANCELLED
                || appointment.getStatus() == AppointmentStatus.NO_SHOW) {
            throw new IllegalStateException("Appointment cannot be cancelled in its current state");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        if (request != null && request.getCancelledReason() != null) {
            appointment.setCancelledReason(request.getCancelledReason());
        }
        appointment.setUpdatedAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appointment);
        return toResponse(saved);
    }

    @Override
    public AppointmentResponse markNoShow(Long id) {
        Appointment appointment = getAppointmentOrThrow(id);
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED
                && appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new IllegalStateException("Only pending or confirmed appointments can be marked as no-show");
        }

        appointment.setStatus(AppointmentStatus.NO_SHOW);
        appointment.setUpdatedAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appointment);
        return toResponse(saved);
    }

    @Override
    public void deleteAppointment(Long id) {
        Appointment appointment = getAppointmentOrThrow(id);
        appointmentRepository.delete(appointment);
    }

    @Override
    public AvailableSlotsResponse getAvailableSlots(Long doctorId, LocalDate date) {
        if (doctorId == null || date == null) {
            throw new IllegalArgumentException("doctorId and date are required");
        }

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay().minusNanos(1);
        List<Appointment> appointments = appointmentRepository
                .findByDoctorIdAndAppointmentTimeBetweenAndStatusIn(doctorId, startOfDay, endOfDay, ACTIVE_STATUSES);

        List<LocalDateTime> availableSlots = new ArrayList<>();
        LocalDateTime slot = date.atTime(CLINIC_OPEN_TIME);
        LocalDateTime end = date.atTime(CLINIC_CLOSE_TIME);
        LocalDateTime now = LocalDateTime.now();

        while (!slot.plusMinutes(SLOT_MINUTES).isAfter(end)) {
            LocalDateTime slotEnd = slot.plusMinutes(SLOT_MINUTES);
            if (date.equals(now.toLocalDate()) && slot.isBefore(now)) {
                slot = slotEnd;
                continue;
            }

            if (!overlapsAny(slot, slotEnd, appointments)) {
                availableSlots.add(slot);
            }
            slot = slotEnd;
        }

        return AvailableSlotsResponse.builder()
                .doctorId(doctorId)
                .date(date)
                .availableSlots(availableSlots)
                .build();
    }

    private Appointment getAppointmentOrThrow(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .appointmentNo(appointment.getAppointmentNo())
                .patientId(appointment.getPatientId())
                .doctorId(appointment.getDoctorId())
                .departmentId(appointment.getDepartmentId())
                .appointmentTime(appointment.getAppointmentTime())
                .durationMinutes(appointment.getDurationMinutes())
                .status(appointment.getStatus())
                .reason(appointment.getReason())
                .patientNotes(appointment.getPatientNotes())
                .doctorNotes(appointment.getDoctorNotes())
                .cancelledReason(appointment.getCancelledReason())
                .cancelledBy(appointment.getCancelledBy())
                .confirmedAt(appointment.getConfirmedAt())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }

    private void validateNoOverlap(Long doctorId,
                                   LocalDateTime appointmentTime,
                                   Integer durationMinutes,
                                   Long excludeId) {
        LocalDate date = appointmentTime.toLocalDate();
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay().minusNanos(1);
        List<Appointment> appointments = appointmentRepository
                .findByDoctorIdAndAppointmentTimeBetweenAndStatusIn(doctorId, startOfDay, endOfDay, ACTIVE_STATUSES);

        LocalDateTime candidateEnd = appointmentTime.plusMinutes(durationMinutes);
        boolean hasOverlap = appointments.stream()
                .filter(existing -> excludeId == null || !existing.getId().equals(excludeId))
                .anyMatch(existing -> overlaps(appointmentTime, candidateEnd,
                        existing.getAppointmentTime(),
                        existing.getAppointmentTime().plusMinutes(existing.getDurationMinutes())));

        if (hasOverlap) {
            throw new IllegalStateException("Appointment time overlaps with an existing appointment");
        }
    }

    private boolean overlapsAny(LocalDateTime start, LocalDateTime end, List<Appointment> appointments) {
        for (Appointment appointment : appointments) {
            LocalDateTime apptStart = appointment.getAppointmentTime();
            LocalDateTime apptEnd = apptStart.plusMinutes(appointment.getDurationMinutes());
            if (overlaps(start, end, apptStart, apptEnd)) {
                return true;
            }
        }
        return false;
    }

    private boolean overlaps(LocalDateTime startA,
                             LocalDateTime endA,
                             LocalDateTime startB,
                             LocalDateTime endB) {
        return startA.isBefore(endB) && endA.isAfter(startB);
    }

    private String generateAppointmentNo() {
        int year = LocalDate.now().getYear();
        for (int attempt = 0; attempt < MAX_APPOINTMENT_NO_ATTEMPTS; attempt++) {
            int sequence = ThreadLocalRandom.current().nextInt(0, 1_000_000);
            String appointmentNo = String.format("LH-%d-%06d", year, sequence);
            if (!appointmentRepository.existsByAppointmentNo(appointmentNo)) {
                return appointmentNo;
            }
        }

        throw new IllegalStateException("Unable to generate a unique appointment number");
    }
}
