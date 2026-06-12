package com.emr.emr_system.modules.doctor.service;

import com.emr.emr_system.modules.auth.entity.Role;
import com.emr.emr_system.modules.auth.entity.RoleName;
import com.emr.emr_system.modules.auth.entity.User;
import com.emr.emr_system.modules.auth.repository.UserRepository;
import com.emr.emr_system.modules.auth.security.UserPrincipal;
import com.emr.emr_system.modules.doctor.dto.DoctorAdminCreateRequest;
import com.emr.emr_system.modules.doctor.dto.DoctorProfileRequest;
import com.emr.emr_system.modules.doctor.dto.DoctorProfileResponse;
import com.emr.emr_system.modules.doctor.entity.DoctorProfile;
import com.emr.emr_system.modules.doctor.repository.DoctorProfileRepository;
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
import java.util.Optional;
import java.util.UUID;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DoctorProfileServiceTest {

    @Mock
    private DoctorProfileRepository doctorProfileRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DoctorProfileService doctorProfileService;

    private User doctorUser;
    private User patientUser;
    private Role doctorRole;
    private Role patientRole;
    private DoctorProfile doctorProfile;
    private UserPrincipal userPrincipal;
    private UUID userId;
    private UUID doctorProfileId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        doctorProfileId = UUID.randomUUID();

        doctorRole = new Role();
        doctorRole.setName(RoleName.DOCTOR);

        patientRole = new Role();
        patientRole.setName(RoleName.PATIENT);

        doctorUser = User.builder()
                .id(userId)
                .email("doctor@test.com")
                .role(doctorRole)
                .build();

        patientUser = User.builder()
                .id(UUID.randomUUID())
                .email("patient@test.com")
                .role(patientRole)
                .build();

        doctorProfile = DoctorProfile.builder()
                .id(doctorProfileId)
                .user(doctorUser)
                .fullName("Test Doctor")
                .employeeCode("DOC-2026-1234")
                .gender(Gender.MALE)
                .phone("123456789")
                .emailContact("contact@test.com")
                .experienceYears(5)
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .build();

        userPrincipal = UserPrincipal.from(doctorUser);
    }

    // --- createMyProfile Tests ---

    @Test
    void createMyProfile_Success() {
        DoctorProfileRequest request = new DoctorProfileRequest();
        request.setFullName("Test Doctor");
        request.setGender(Gender.MALE);

        when(userRepository.findByEmail(userPrincipal.getUsername())).thenReturn(Optional.of(doctorUser));
        when(doctorProfileRepository.existsByUser_Id(userId)).thenReturn(false);
        when(doctorProfileRepository.existsByEmployeeCode(any())).thenReturn(false);
        when(doctorProfileRepository.save(any(DoctorProfile.class))).thenReturn(doctorProfile);

        DoctorProfileResponse response = doctorProfileService.createMyProfile(userPrincipal, request);

        assertNotNull(response);
        assertEquals("Test Doctor", response.getFullName());
        verify(doctorProfileRepository, times(1)).save(any(DoctorProfile.class));
    }

    @Test
    void createMyProfile_UserNotFound_ThrowsException() {
        DoctorProfileRequest request = new DoctorProfileRequest();
        when(userRepository.findByEmail(userPrincipal.getUsername())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> doctorProfileService.createMyProfile(userPrincipal, request));
    }

    @Test
    void createMyProfile_NotAllowed_ThrowsException() {
        DoctorProfileRequest request = new DoctorProfileRequest();
        UserPrincipal patientPrincipal = UserPrincipal.from(patientUser);
        when(userRepository.findByEmail(patientPrincipal.getUsername())).thenReturn(Optional.of(patientUser));

        assertThrows(AccessDeniedException.class, () -> doctorProfileService.createMyProfile(patientPrincipal, request));
    }

    @Test
    void createMyProfile_AlreadyExists_ThrowsException() {
        DoctorProfileRequest request = new DoctorProfileRequest();
        when(userRepository.findByEmail(userPrincipal.getUsername())).thenReturn(Optional.of(doctorUser));
        when(doctorProfileRepository.existsByUser_Id(userId)).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> doctorProfileService.createMyProfile(userPrincipal, request));
    }

    // --- getDoctorById Tests ---

    @Test
    void getDoctorById_Success() {
        when(doctorProfileRepository.findById(doctorProfileId)).thenReturn(Optional.of(doctorProfile));

        DoctorProfileResponse response = doctorProfileService.getDoctorById(doctorProfileId);

        assertNotNull(response);
        assertEquals(doctorProfileId, response.getId());
    }

    @Test
    void getDoctorById_NotFound_ThrowsException() {
        when(doctorProfileRepository.findById(doctorProfileId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> doctorProfileService.getDoctorById(doctorProfileId));
    }

    // --- updateMyProfile Tests ---

    @Test
    void updateMyProfile_Success() {
        DoctorProfileRequest request = new DoctorProfileRequest();
        request.setFullName("Updated Doctor");

        when(userRepository.findByEmail(userPrincipal.getUsername())).thenReturn(Optional.of(doctorUser));
        when(doctorProfileRepository.findByUser_Id(userId)).thenReturn(Optional.of(doctorProfile));
        when(doctorProfileRepository.save(any(DoctorProfile.class))).thenReturn(doctorProfile);

        DoctorProfileResponse response = doctorProfileService.updateMyProfile(userPrincipal, request);

        assertNotNull(response);
        verify(doctorProfileRepository, times(1)).save(any(DoctorProfile.class));
    }
}
