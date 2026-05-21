package com.emr.emr_system.modules.appointments.controller;

import com.emr.emr_system.modules.appointments.dto.AppointmentCancelRequest;
import com.emr.emr_system.modules.appointments.dto.AppointmentCreateRequest;
import com.emr.emr_system.modules.appointments.dto.AppointmentResponse;
import com.emr.emr_system.modules.appointments.dto.AppointmentUpdateRequest;
import com.emr.emr_system.modules.appointments.dto.AvailableSlotsResponse;
import com.emr.emr_system.modules.appointments.entity.AppointmentStatus;
import com.emr.emr_system.modules.appointments.service.AppointmentService;
import com.emr.emr_system.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentsController {
    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AppointmentResponse>>> getAppointments(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) LocalDate date) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AppointmentResponse> result = appointmentService.getAppointments(doctorId, patientId, status, date, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Appointments retrieved"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(@PathVariable Long id) {
        AppointmentResponse result = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Appointment retrieved"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(@RequestBody AppointmentCreateRequest request) {
        AppointmentResponse result = appointmentService.createAppointment(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Appointment created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointment(
            @PathVariable Long id,
            @RequestBody AppointmentUpdateRequest request) {
        AppointmentResponse result = appointmentService.updateAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Appointment updated"));
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirmAppointment(@PathVariable Long id) {
        AppointmentResponse result = appointmentService.confirmAppointment(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Appointment confirmed"));
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<ApiResponse<AppointmentResponse>> startAppointment(@PathVariable Long id) {
        AppointmentResponse result = appointmentService.startAppointment(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Appointment started"));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<AppointmentResponse>> completeAppointment(@PathVariable Long id) {
        AppointmentResponse result = appointmentService.completeAppointment(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Appointment completed"));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(
            @PathVariable Long id,
            @RequestBody AppointmentCancelRequest request) {
        AppointmentResponse result = appointmentService.cancelAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Appointment cancelled"));
    }

    @PatchMapping("/{id}/no-show")
    public ResponseEntity<ApiResponse<AppointmentResponse>> markNoShow(@PathVariable Long id) {
        AppointmentResponse result = appointmentService.markNoShow(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Appointment marked as no-show"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Appointment deleted"));
    }

    @GetMapping("/available-slots")
    public ResponseEntity<ApiResponse<AvailableSlotsResponse>> getAvailableSlots(
            @RequestParam Long doctorId,
            @RequestParam LocalDate date) {
        AvailableSlotsResponse result = appointmentService.getAvailableSlots(doctorId, date);
        return ResponseEntity.ok(ApiResponse.success(result, "Available slots retrieved"));
    }
}
