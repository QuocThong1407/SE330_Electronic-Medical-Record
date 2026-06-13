package com.emr.emr_system.modules.auth.service.user;

import com.emr.emr_system.modules.auth.dto.user.UserAdminCreateRequest;
import com.emr.emr_system.modules.auth.dto.user.UserAdminResponse;
import com.emr.emr_system.modules.auth.entity.Role;
import com.emr.emr_system.modules.auth.entity.RoleName;
import com.emr.emr_system.modules.auth.entity.User;
import com.emr.emr_system.modules.auth.repository.RoleRepository;
import com.emr.emr_system.modules.auth.repository.UserRepository;
import com.emr.emr_system.modules.doctor.repository.DoctorProfileRepository;
import com.emr.emr_system.modules.patient.repository.PatientProfileRepository;
import com.emr.emr_system.shared.exceptions.BadRequestException;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private DoctorProfileRepository doctorProfileRepository;
    @Mock
    private PatientProfileRepository patientProfileRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User user;
    private Role role;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        role = new Role();
        role.setId(UUID.randomUUID());
        role.setName(RoleName.ADMIN);

        user = User.builder()
                .id(userId)
                .email("admin@test.com")
                .passwordHash("hashed")
                .role(role)
                .active(true)
                .build();
    }

    @Test
    void create_Success() {
        UserAdminCreateRequest request = new UserAdminCreateRequest();
        request.setEmail("admin@test.com");
        request.setPassword("password");
        request.setRole(RoleName.ADMIN);
        request.setActive(true);

        when(userRepository.existsByEmail("admin@test.com")).thenReturn(false);
        when(roleRepository.findByName(RoleName.ADMIN)).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("password")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserAdminResponse response = userService.create(request);

        assertNotNull(response);
        assertEquals("admin@test.com", response.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void create_DuplicateEmail_ThrowsException() {
        UserAdminCreateRequest request = new UserAdminCreateRequest();
        request.setEmail("admin@test.com");

        when(userRepository.existsByEmail("admin@test.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> userService.create(request));
    }

    @Test
    void getById_Success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        UserAdminResponse response = userService.getById(userId);

        assertNotNull(response);
        assertEquals(userId, response.getId());
    }

    @Test
    void delete_Success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(doctorProfileRepository.existsByUser_Id(userId)).thenReturn(false);
        when(patientProfileRepository.existsByUser_Id(userId)).thenReturn(false);

        assertDoesNotThrow(() -> userService.delete(userId));
        verify(userRepository, times(1)).delete(user);
    }

    @Test
    void delete_LinkedToDoctor_ThrowsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(doctorProfileRepository.existsByUser_Id(userId)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> userService.delete(userId));
    }
}
