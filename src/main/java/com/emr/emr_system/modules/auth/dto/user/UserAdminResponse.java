package com.emr.emr_system.modules.auth.dto.user;

import com.emr.emr_system.modules.auth.entity.RoleName;
import com.emr.emr_system.modules.auth.entity.User;
import com.emr.emr_system.modules.doctor.entity.DoctorProfile;
import com.emr.emr_system.modules.patient.entity.PatientProfile;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserAdminResponse {
    private UUID id;
    private String email;
    private RoleName role;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LinkedProfileResponse doctorProfile;
    private LinkedProfileResponse patientProfile;

    public static UserAdminResponse from(User user, DoctorProfile doctorProfile, PatientProfile patientProfile) {
        return UserAdminResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .active(Boolean.TRUE.equals(user.getActive()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .doctorProfile(doctorProfile == null ? null : LinkedProfileResponse.fromDoctor(doctorProfile))
                .patientProfile(patientProfile == null ? null : LinkedProfileResponse.fromPatient(patientProfile))
                .build();
    }
}
