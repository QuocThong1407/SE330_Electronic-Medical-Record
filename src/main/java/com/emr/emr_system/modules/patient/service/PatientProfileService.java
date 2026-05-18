package com.emr.emr_system.modules.patient.service;

import com.emr.emr_system.modules.auth.entity.RoleName;
import com.emr.emr_system.modules.auth.entity.User;
import com.emr.emr_system.modules.auth.repository.UserRepository;
import com.emr.emr_system.modules.auth.security.UserPrincipal;
import com.emr.emr_system.modules.patient.dto.PatientProfileRequest;
import com.emr.emr_system.modules.patient.dto.PatientProfileResponse;
import com.emr.emr_system.modules.patient.entity.PatientProfile;
import com.emr.emr_system.modules.patient.repository.PatientProfileRepository;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientProfileService {

    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;

    public PatientProfileResponse createMyProfile(UserPrincipal principal, PatientProfileRequest request) {
        User user = loadCurrentUser(principal);
        ensureAllowed(user);

        if (patientProfileRepository.existsByUser_Id(user.getId())) {
            throw new DuplicateResourceException("Patient profile", "userId", user.getId());
        }

        PatientProfile profile = PatientProfile.builder()
                .user(user)
                .fullName(request.getFullName())
                .gender(request.getGender())
                .phone(request.getPhone())
                .emailContact(request.getEmailContact())
                .dateOfBirth(request.getDateOfBirth())
                .bloodType(request.getBloodType())
                .build();

        return PatientProfileResponse.from(patientProfileRepository.save(profile));
    }

    public PatientProfileResponse updateMyProfile(UserPrincipal principal, PatientProfileRequest request) {
        User user = loadCurrentUser(principal);
        ensureAllowed(user);

        PatientProfile profile = patientProfileRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile", "userId", user.getId()));

        profile.setFullName(request.getFullName());
        profile.setGender(request.getGender());
        profile.setPhone(request.getPhone());
        profile.setEmailContact(request.getEmailContact());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setBloodType(request.getBloodType());

        return PatientProfileResponse.from(patientProfileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public PatientProfileResponse getMyProfile(UserPrincipal principal) {
        User user = loadCurrentUser(principal);
        PatientProfile profile = patientProfileRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile", "userId", user.getId()));
        return PatientProfileResponse.from(profile);
    }

    private User loadCurrentUser(UserPrincipal principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", principal.getUsername()));
    }

    private void ensureAllowed(User user) {
        RoleName roleName = user.getRole().getName();
        if (roleName != RoleName.PATIENT && roleName != RoleName.ADMIN) {
            throw new AccessDeniedException("Only PATIENT or ADMIN users can create patient profiles");
        }
    }
}
