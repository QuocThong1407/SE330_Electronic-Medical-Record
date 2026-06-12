package com.emr.emr_system.modules.appointments.service.impl;

import com.emr.emr_system.modules.appointments.dto.AppointmentCreateRequest;
import com.emr.emr_system.modules.appointments.dto.AppointmentResponse;
import com.emr.emr_system.modules.appointments.dto.AppointmentUpdateRequest;
import com.emr.emr_system.modules.appointments.entity.Appointment;
import com.emr.emr_system.modules.appointments.entity.AppointmentStatus;
import com.emr.emr_system.modules.appointments.repository.AppointmentRepository;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AppointmentServiceImplTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    private UUID appointmentId;
    private UUID doctorId;
    private UUID patientId;
    private Appointment appointment;
    private LocalDateTime appointmentTime;

    @BeforeEach
    void setUp() {
        appointmentId = UUID.randomUUID();
        doctorId = UUID.randomUUID();
        patientId = UUID.randomUUID();
        appointmentTime = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);

        appointment = Appointment.builder()
                .id(appointmentId)
                .appointmentNo("LH-2026-123456")
                .doctorId(doctorId)
                .patientId(patientId)
                .appointmentTime(appointmentTime)
                .durationMinutes(30)
                .status(AppointmentStatus.PENDING)
                .build();
    }

    // --- getAppointmentById ---

    @Test
    void getAppointmentById_Success() {
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        AppointmentResponse response = appointmentService.getAppointmentById(appointmentId);

        assertNotNull(response);
        assertEquals(appointmentId, response.getId());
        assertEquals(AppointmentStatus.PENDING, response.getStatus());
    }

    @Test
    void getAppointmentById_NotFound_ThrowsException() {
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.getAppointmentById(appointmentId));
    }

    // --- createAppointment ---

    @Test
    void createAppointment_Success() {
        AppointmentCreateRequest request = new AppointmentCreateRequest();
        request.setDoctorId(doctorId);
        request.setPatientId(patientId);
        request.setAppointmentTime(appointmentTime);
        request.setDurationMinutes(30);

        // No overlap
        when(appointmentRepository.findByDoctorIdAndAppointmentTimeBetweenAndStatusIn(any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(appointmentRepository.existsByAppointmentNo(anyString())).thenReturn(false);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        AppointmentResponse response = appointmentService.createAppointment(request);

        assertNotNull(response);
        assertEquals(doctorId, response.getDoctorId());
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void createAppointment_Overlap_ThrowsException() {
        AppointmentCreateRequest request = new AppointmentCreateRequest();
        request.setDoctorId(doctorId);
        request.setPatientId(patientId);
        request.setAppointmentTime(appointmentTime);
        request.setDurationMinutes(30);

        // Simulate an existing appointment at the same time
        when(appointmentRepository.findByDoctorIdAndAppointmentTimeBetweenAndStatusIn(any(), any(), any(), any()))
                .thenReturn(List.of(appointment));

        assertThrows(IllegalStateException.class, () -> appointmentService.createAppointment(request));
    }

    // --- updateAppointment ---

    @Test
    void updateAppointment_Success() {
        AppointmentUpdateRequest request = new AppointmentUpdateRequest();
        request.setReason("Updated Reason");
        request.setAppointmentTime(appointmentTime.plusDays(1));
        request.setDurationMinutes(45);

        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.findByDoctorIdAndAppointmentTimeBetweenAndStatusIn(any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        AppointmentResponse response = appointmentService.updateAppointment(appointmentId, request);

        assertNotNull(response);
        assertEquals("Updated Reason", appointment.getReason());
        assertEquals(45, appointment.getDurationMinutes());
    }

    @Test
    void updateAppointment_InvalidState_ThrowsException() {
        appointment.setStatus(AppointmentStatus.COMPLETED);
        AppointmentUpdateRequest request = new AppointmentUpdateRequest();
        request.setReason("Updated Reason");

        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        assertThrows(IllegalStateException.class, () -> appointmentService.updateAppointment(appointmentId, request));
    }

    @Test
    void updateAppointment_Overlap_ThrowsException() {
        AppointmentUpdateRequest request = new AppointmentUpdateRequest();
        request.setAppointmentTime(appointmentTime.plusHours(1));
        request.setDurationMinutes(30);

        Appointment conflictingAppointment = new Appointment();
        conflictingAppointment.setId(UUID.randomUUID()); // Different ID to simulate overlap
        conflictingAppointment.setAppointmentTime(appointmentTime.plusHours(1).minusMinutes(10));
        conflictingAppointment.setDurationMinutes(30);

        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.findByDoctorIdAndAppointmentTimeBetweenAndStatusIn(any(), any(), any(), any()))
                .thenReturn(List.of(conflictingAppointment));

        assertThrows(IllegalStateException.class, () -> appointmentService.updateAppointment(appointmentId, request));
    }

    // --- confirmAppointment ---

    @Test
    void confirmAppointment_Success() {
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        AppointmentResponse response = appointmentService.confirmAppointment(appointmentId);

        assertNotNull(response);
        assertEquals(AppointmentStatus.CONFIRMED, appointment.getStatus());
        verify(appointmentRepository, times(1)).save(appointment);
    }

    @Test
    void confirmAppointment_InvalidState_ThrowsException() {
        appointment.setStatus(AppointmentStatus.COMPLETED);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        assertThrows(IllegalStateException.class, () -> appointmentService.confirmAppointment(appointmentId));
    }

    // --- startAppointment ---

    @Test
    void startAppointment_Success() {
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        AppointmentResponse response = appointmentService.startAppointment(appointmentId);

        assertNotNull(response);
        assertEquals(AppointmentStatus.IN_PROGRESS, appointment.getStatus());
    }

    // --- cancelAppointment ---

    @Test
    void cancelAppointment_Success() {
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        AppointmentResponse response = appointmentService.cancelAppointment(appointmentId, null);

        assertNotNull(response);
        assertEquals(AppointmentStatus.CANCELLED, appointment.getStatus());
    }

    @Test
    void cancelAppointment_AlreadyCompleted_ThrowsException() {
        appointment.setStatus(AppointmentStatus.COMPLETED);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        assertThrows(IllegalStateException.class, () -> appointmentService.cancelAppointment(appointmentId, null));
    }
}
