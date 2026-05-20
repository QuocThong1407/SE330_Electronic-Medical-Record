package com.emr.emr_system.modules.patient.service;

import com.emr.emr_system.modules.auth.entity.RoleName;
import com.emr.emr_system.modules.auth.entity.User;
import com.emr.emr_system.modules.auth.repository.UserRepository;
import com.emr.emr_system.modules.auth.security.UserPrincipal;
import com.emr.emr_system.modules.patient.dto.PatientLinkUserRequest;
import com.emr.emr_system.modules.patient.dto.PatientAdminCreateRequest;
import com.emr.emr_system.modules.patient.dto.PatientProfileRequest;
import com.emr.emr_system.modules.patient.dto.PatientProfileResponse;
import com.emr.emr_system.modules.patient.dto.PatientWalkInCreateRequest;
import com.emr.emr_system.modules.patient.entity.PatientProfile;
import com.emr.emr_system.modules.patient.repository.PatientProfileRepository;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

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
        return createProfileForUser(user, request.getFullName(), request.getGender(), request.getDateOfBirth(),
                request.getIdCardNumber(), request.getInsuranceNumber(), request.getInsuranceExpDate(), request.getPhone(),
                request.getEmailContact(), request.getAddress(), request.getCity(), request.getBloodType(),
                request.getEmergencyContactName(), request.getEmergencyContactPhone(),
                request.getEmergencyContactRelation(), request.getNotes());
    }

    public PatientProfileResponse createPatientByAdmin(PatientAdminCreateRequest request) {
        User user = loadUserById(request.getUserId());
        ensureRole(user, RoleName.PATIENT);
        return createProfileForUser(user, request.getFullName(), request.getGender(), request.getDateOfBirth(),
                request.getIdCardNumber(), request.getInsuranceNumber(), request.getInsuranceExpDate(), request.getPhone(),
                request.getEmailContact(), request.getAddress(), request.getCity(), request.getBloodType(),
                request.getEmergencyContactName(), request.getEmergencyContactPhone(),
                request.getEmergencyContactRelation(), request.getNotes());
    }

    public PatientProfileResponse createWalkInProfile(PatientWalkInCreateRequest request) {
        return createProfileWithoutUser(request.getFullName(), request.getGender(), request.getDateOfBirth(),
                request.getIdCardNumber(), request.getInsuranceNumber(), request.getInsuranceExpDate(), request.getPhone(),
                request.getEmailContact(), request.getAddress(), request.getCity(), request.getBloodType(),
                request.getEmergencyContactName(), request.getEmergencyContactPhone(),
                request.getEmergencyContactRelation(), request.getNotes());
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

    @Transactional(readOnly = true)
    public List<PatientProfileResponse> getAllPatients() {
        return patientProfileRepository.findAll()
                .stream()
                .map(PatientProfileResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PatientProfileResponse getPatientById(UUID id) {
        PatientProfile profile = patientProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile", "id", id));
        return PatientProfileResponse.from(profile);
    }

    public PatientProfileResponse updatePatientById(UUID id, PatientProfileRequest request) {
        PatientProfile profile = patientProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile", "id", id));

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

    public PatientProfileResponse linkUserToProfile(UUID profileId, PatientLinkUserRequest request) {
        PatientProfile profile = patientProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile", "id", profileId));

        if (profile.getUser() != null) {
            throw new DuplicateResourceException("Patient profile", "userId", profile.getUser().getId());
        }

        User user = loadUserById(request.getUserId());
        ensureRole(user, RoleName.PATIENT);

        if (patientProfileRepository.existsByUser_Id(user.getId())) {
            throw new DuplicateResourceException("Patient profile", "userId", user.getId());
        }

        profile.setUser(user);
        return PatientProfileResponse.from(patientProfileRepository.save(profile));
    }

    private User loadCurrentUser(UserPrincipal principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", principal.getUsername()));
    }

    private User loadUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private void ensureAllowed(User user) {
        RoleName roleName = user.getRole().getName();
        if (roleName != RoleName.PATIENT && roleName != RoleName.ADMIN) {
            throw new AccessDeniedException("Only PATIENT or ADMIN users can create patient profiles");
        }
    }

    private void ensureRole(User user, RoleName expectedRole) {
        if (user.getRole().getName() != expectedRole) {
            throw new AccessDeniedException("Target user must have role " + expectedRole);
        }
    }

    private PatientProfileResponse createProfileForUser(
            User user,
            String fullName,
            com.emr.emr_system.shared.enums.Gender gender,
            java.time.LocalDate dateOfBirth,
            String idCardNumber,
            String insuranceNumber,
            java.time.LocalDate insuranceExpDate,
            String phone,
            String emailContact,
            String address,
            String city,
            String bloodType,
            String emergencyContactName,
            String emergencyContactPhone,
            String emergencyContactRelation,
            String notes
    ) {
        if (patientProfileRepository.existsByUser_Id(user.getId())) {
            throw new DuplicateResourceException("Patient profile", "userId", user.getId());
        }

        PatientProfile profile = PatientProfile.builder()
                .user(user)
                .patientCode(generateUniquePatientCode())
                .fullName(fullName)
                .gender(gender)
                .dateOfBirth(dateOfBirth)
                .idCardNumber(idCardNumber)
                .insuranceNumber(insuranceNumber)
                .insuranceExpDate(insuranceExpDate)
                .phone(phone)
                .emailContact(emailContact)
                .address(address)
                .city(city)
                .bloodType(bloodType)
                .emergencyContactName(emergencyContactName)
                .emergencyContactPhone(emergencyContactPhone)
                .emergencyContactRelation(emergencyContactRelation)
                .notes(notes)
                .build();

        return PatientProfileResponse.from(patientProfileRepository.save(profile));
    }

    private PatientProfileResponse createProfileWithoutUser(
            String fullName,
            com.emr.emr_system.shared.enums.Gender gender,
            java.time.LocalDate dateOfBirth,
            String idCardNumber,
            String insuranceNumber,
            java.time.LocalDate insuranceExpDate,
            String phone,
            String emailContact,
            String address,
            String city,
            String bloodType,
            String emergencyContactName,
            String emergencyContactPhone,
            String emergencyContactRelation,
            String notes
    ) {
        PatientProfile profile = PatientProfile.builder()
                .patientCode(generateUniquePatientCode())
                .fullName(fullName)
                .gender(gender)
                .dateOfBirth(dateOfBirth)
                .idCardNumber(idCardNumber)
                .insuranceNumber(insuranceNumber)
                .insuranceExpDate(insuranceExpDate)
                .phone(phone)
                .emailContact(emailContact)
                .address(address)
                .city(city)
                .bloodType(bloodType)
                .emergencyContactName(emergencyContactName)
                .emergencyContactPhone(emergencyContactPhone)
                .emergencyContactRelation(emergencyContactRelation)
                .notes(notes)
                .build();

        return PatientProfileResponse.from(patientProfileRepository.save(profile));
    }

    private String generateUniquePatientCode() {
        String code;
        do {
            code = "PAT-" + java.time.LocalDate.now().getYear() + "-" + (1000 + secureRandom.nextInt(9000));
        } while (patientProfileRepository.existsByPatientCode(code));
        return code;
    }
}
