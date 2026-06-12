package com.emr.emr_system.modules.patient.service;

import com.emr.emr_system.modules.auth.entity.Role;
import com.emr.emr_system.modules.auth.entity.RoleName;
import com.emr.emr_system.modules.auth.entity.User;
import com.emr.emr_system.modules.auth.repository.UserRepository;
import com.emr.emr_system.modules.auth.security.UserPrincipal;
import com.emr.emr_system.modules.patient.dto.PatientLinkUserRequest;
import com.emr.emr_system.modules.patient.dto.PatientProfileRequest;
import com.emr.emr_system.modules.patient.dto.PatientProfileResponse;
import com.emr.emr_system.modules.patient.dto.PatientWalkInCreateRequest;
import com.emr.emr_system.modules.patient.entity.PatientProfile;
import com.emr.emr_system.modules.patient.repository.PatientProfileRepository;
import com.emr.emr_system.shared.enums.Gender;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PatientProfileServiceTest {

    @Mock
    private PatientProfileRepository patientProfileRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PatientProfileService patientProfileService;

    private User patientUser;
    private User doctorUser;
    private Role patientRole;
    private Role doctorRole;
    private PatientProfile patientProfile;
    private UserPrincipal userPrincipal;
    private UUID userId;
    private UUID profileId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        profileId = UUID.randomUUID();

        patientRole = new Role();
        patientRole.setName(RoleName.PATIENT);

        doctorRole = new Role();
        doctorRole.setName(RoleName.DOCTOR);

        patientUser = User.builder()
                .id(userId)
                .email("patient@test.com")
                .role(patientRole)
                .build();

        doctorUser = User.builder()
                .id(UUID.randomUUID())
                .email("doctor@test.com")
                .role(doctorRole)
                .build();

        patientProfile = PatientProfile.builder()
                .id(profileId)
                .user(patientUser)
                .patientCode("PAT-2026-1234")
                .fullName("Test Patient")
                .gender(Gender.MALE)
                .dateOfBirth(LocalDate.of(1995, 1, 1))
                .phone("987654321")
                .build();

        userPrincipal = UserPrincipal.from(patientUser);
    }

    // --- createMyProfile Tests ---

    @Test
    void createMyProfile_Success() {
        PatientProfileRequest request = new PatientProfileRequest();
        request.setFullName("Test Patient");
        request.setGender(Gender.MALE);

        when(userRepository.findByEmail(userPrincipal.getUsername())).thenReturn(Optional.of(patientUser));
        when(patientProfileRepository.existsByUser_Id(userId)).thenReturn(false);
        when(patientProfileRepository.existsByPatientCode(any())).thenReturn(false);
        when(patientProfileRepository.save(any(PatientProfile.class))).thenReturn(patientProfile);

        PatientProfileResponse response = patientProfileService.createMyProfile(userPrincipal, request);

        assertNotNull(response);
        assertEquals("Test Patient", response.getFullName());
        verify(patientProfileRepository, times(1)).save(any(PatientProfile.class));
    }

    @Test
    void createMyProfile_NotAllowed_ThrowsException() {
        PatientProfileRequest request = new PatientProfileRequest();
        UserPrincipal docPrincipal = UserPrincipal.from(doctorUser);
        when(userRepository.findByEmail(docPrincipal.getUsername())).thenReturn(Optional.of(doctorUser));

        assertThrows(AccessDeniedException.class, () -> patientProfileService.createMyProfile(docPrincipal, request));
    }

    @Test
    void createMyProfile_AlreadyExists_ThrowsException() {
        PatientProfileRequest request = new PatientProfileRequest();
        when(userRepository.findByEmail(userPrincipal.getUsername())).thenReturn(Optional.of(patientUser));
        when(patientProfileRepository.existsByUser_Id(userId)).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> patientProfileService.createMyProfile(userPrincipal, request));
    }

    // --- createWalkInProfile Tests ---

    @Test
    void createWalkInProfile_Success() {
        PatientWalkInCreateRequest request = new PatientWalkInCreateRequest();
        request.setFullName("WalkIn Patient");

        PatientProfile walkInProfile = PatientProfile.builder()
                .id(UUID.randomUUID())
                .fullName("WalkIn Patient")
                .patientCode("PAT-2026-9999")
                .build();

        when(patientProfileRepository.existsByPatientCode(any())).thenReturn(false);
        when(patientProfileRepository.save(any(PatientProfile.class))).thenReturn(walkInProfile);

        PatientProfileResponse response = patientProfileService.createWalkInProfile(request);

        assertNotNull(response);
        assertEquals("WalkIn Patient", response.getFullName());
        verify(patientProfileRepository, times(1)).save(any(PatientProfile.class));
    }

    // --- linkUserToProfile Tests ---

    @Test
    void linkUserToProfile_Success() {
        PatientLinkUserRequest request = new PatientLinkUserRequest();
        request.setUserId(userId);

        PatientProfile walkInProfile = PatientProfile.builder()
                .id(profileId)
                .fullName("WalkIn Patient")
                .build();

        when(patientProfileRepository.findById(profileId)).thenReturn(Optional.of(walkInProfile));
        when(userRepository.findById(userId)).thenReturn(Optional.of(patientUser));
        when(patientProfileRepository.existsByUser_Id(userId)).thenReturn(false);
        when(patientProfileRepository.save(any(PatientProfile.class))).thenReturn(patientProfile);

        PatientProfileResponse response = patientProfileService.linkUserToProfile(profileId, request);

        assertNotNull(response);
        verify(patientProfileRepository, times(1)).save(walkInProfile);
        assertEquals(patientUser, walkInProfile.getUser());
    }

    @Test
    void linkUserToProfile_ProfileAlreadyHasUser_ThrowsException() {
        PatientLinkUserRequest request = new PatientLinkUserRequest();
        request.setUserId(userId);

        when(patientProfileRepository.findById(profileId)).thenReturn(Optional.of(patientProfile)); // already has user

        assertThrows(DuplicateResourceException.class, () -> patientProfileService.linkUserToProfile(profileId, request));
    }
}
