package com.emr.emr_system.modules.auth.service.auth;

import com.emr.emr_system.modules.auth.dto.auth.AuthResponse;
import com.emr.emr_system.modules.auth.dto.auth.LoginRequest;
import com.emr.emr_system.modules.auth.dto.auth.RegisterRequest;
import com.emr.emr_system.modules.auth.dto.user.UserResponse;
import com.emr.emr_system.modules.auth.entity.Role;
import com.emr.emr_system.modules.auth.entity.RoleName;
import com.emr.emr_system.modules.auth.entity.User;
import com.emr.emr_system.modules.auth.repository.RoleRepository;
import com.emr.emr_system.modules.auth.repository.UserRepository;
import com.emr.emr_system.modules.auth.security.JwtService;
import com.emr.emr_system.modules.auth.security.UserPrincipal;
import com.emr.emr_system.shared.exceptions.AuthenticationFailedException;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("User", "email", email);
        }

        Role role = roleRepository.findByName(RoleName.PATIENT)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", RoleName.PATIENT.name()));

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);
        UserPrincipal principal = UserPrincipal.from(savedUser);
        String token = jwtService.generateToken(principal);

        return AuthResponse.of(token, jwtService.getExpiration(), UserResponse.from(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationFailedException("Invalid email or password"));

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new AuthenticationFailedException("Account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationFailedException("Invalid email or password");
        }

        UserPrincipal principal = UserPrincipal.from(user);
        String token = jwtService.generateToken(principal);

        return AuthResponse.of(token, jwtService.getExpiration(), UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return UserResponse.from(user);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
