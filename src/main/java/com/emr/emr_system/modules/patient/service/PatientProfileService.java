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

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientProfileService {

    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public PatientProfileResponse createMyProfile(UserPrincipal principal, PatientProfileRequest request) {
        User user = loadCurrentUser(principal);
        ensureAllowed(user);

        if (patientProfileRepository.existsByUser_Id(user.getId())) {
            throw new DuplicateResourceException("Patient profile", "userId", user.getId());
        }

        PatientProfile profile = PatientProfile.builder()
                .user(user)
                .patientCode(generateUniquePatientCode())
                .fullName(request.getFullName())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .idCardNumber(request.getIdCardNumber())
                .insuranceNumber(request.getInsuranceNumber())
                .insuranceExpDate(request.getInsuranceExpDate())
                .phone(request.getPhone())
                .emailContact(request.getEmailContact())
                .address(request.getAddress())
                .city(request.getCity())
                .bloodType(request.getBloodType())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .emergencyContactRelation(request.getEmergencyContactRelation())
                .notes(request.getNotes())
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
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setIdCardNumber(request.getIdCardNumber());
        profile.setInsuranceNumber(request.getInsuranceNumber());
        profile.setInsuranceExpDate(request.getInsuranceExpDate());
        profile.setPhone(request.getPhone());
        profile.setEmailContact(request.getEmailContact());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setBloodType(request.getBloodType());
        profile.setEmergencyContactName(request.getEmergencyContactName());
        profile.setEmergencyContactPhone(request.getEmergencyContactPhone());
        profile.setEmergencyContactRelation(request.getEmergencyContactRelation());
        profile.setNotes(request.getNotes());

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

    private String generateUniquePatientCode() {
        String code;
        do {
            code = "PAT-" + java.time.LocalDate.now().getYear() + "-" + (1000 + secureRandom.nextInt(9000));
        } while (patientProfileRepository.existsByPatientCode(code));
        return code;
    }
}
