package com.emr.emr_system.modules.auth.service.auth;

import com.emr.emr_system.modules.auth.dto.auth.AuthResponse;
import com.emr.emr_system.modules.auth.dto.auth.LoginRequest;
import com.emr.emr_system.modules.auth.dto.auth.RegisterRequest;
import com.emr.emr_system.modules.auth.entity.Role;
import com.emr.emr_system.modules.auth.entity.RoleName;
import com.emr.emr_system.modules.auth.entity.User;
import com.emr.emr_system.modules.auth.repository.RoleRepository;
import com.emr.emr_system.modules.auth.repository.UserRepository;
import com.emr.emr_system.modules.auth.security.JwtService;
import com.emr.emr_system.shared.exceptions.AuthenticationFailedException;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User user;
    private Role role;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        role = new Role();
        role.setId(UUID.randomUUID());
        role.setName(RoleName.PATIENT);

        user = User.builder()
                .id(userId)
                .email("test@emr.com")
                .passwordHash("hashedpassword")
                .role(role)
                .active(true)
                .build();
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@emr.com");
        request.setPassword("password");

        when(userRepository.existsByEmail("test@emr.com")).thenReturn(false);
        when(roleRepository.findByName(RoleName.PATIENT)).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("password")).thenReturn("hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(any())).thenReturn("token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("token", response.getAccessToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_DuplicateEmail_ThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@emr.com");
        request.setPassword("password");

        when(userRepository.existsByEmail("test@emr.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@emr.com");
        request.setPassword("password");

        when(userRepository.findByEmail("test@emr.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashedpassword")).thenReturn(true);
        when(jwtService.generateToken(any())).thenReturn("token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("token", response.getAccessToken());
    }

    @Test
    void login_InvalidEmail_ThrowsException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("wrong@emr.com");

        when(userRepository.findByEmail("wrong@emr.com")).thenReturn(Optional.empty());

        assertThrows(AuthenticationFailedException.class, () -> authService.login(request));
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@emr.com");
        request.setPassword("wrongpassword");

        when(userRepository.findByEmail("test@emr.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "hashedpassword")).thenReturn(false);

        assertThrows(AuthenticationFailedException.class, () -> authService.login(request));
    }

    @Test
    void login_InactiveUser_ThrowsException() {
        user.setActive(false);
        LoginRequest request = new LoginRequest();
        request.setEmail("test@emr.com");
        request.setPassword("password");

        when(userRepository.findByEmail("test@emr.com")).thenReturn(Optional.of(user));

        assertThrows(AuthenticationFailedException.class, () -> authService.login(request));
    }
}
