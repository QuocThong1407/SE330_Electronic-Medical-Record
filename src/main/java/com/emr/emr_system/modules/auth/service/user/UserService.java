package com.emr.emr_system.modules.auth.service.user;

import com.emr.emr_system.modules.auth.dto.user.UserAdminCreateRequest;
import com.emr.emr_system.modules.auth.dto.user.UserAdminResponse;
import com.emr.emr_system.modules.auth.dto.user.UserAdminUpdateRequest;
import com.emr.emr_system.modules.auth.dto.user.UserStatusUpdateRequest;
import com.emr.emr_system.modules.auth.entity.Role;
import com.emr.emr_system.modules.auth.entity.RoleName;
import com.emr.emr_system.modules.auth.entity.User;
import com.emr.emr_system.modules.auth.repository.RoleRepository;
import com.emr.emr_system.modules.auth.repository.UserRepository;
import com.emr.emr_system.modules.doctor.entity.DoctorProfile;
import com.emr.emr_system.modules.doctor.repository.DoctorProfileRepository;
import com.emr.emr_system.modules.patient.entity.PatientProfile;
import com.emr.emr_system.modules.patient.repository.PatientProfileRepository;
import com.emr.emr_system.shared.exceptions.BadRequestException;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public UserAdminResponse create(UserAdminCreateRequest request) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("User", "email", email);
        }

        Role role = findRole(request.getRole());

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(request.getActive() == null ? true : request.getActive())
                .build();

        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserAdminResponse> getAll(RoleName role, Boolean active) {
        return userRepository.findAll().stream()
                .filter(user -> role == null || user.getRole().getName() == role)
                .filter(user -> active == null || Boolean.TRUE.equals(user.getActive()) == active)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserAdminResponse getById(UUID id) {
        return toResponse(findUser(id));
    }

    public UserAdminResponse update(UUID id, UserAdminUpdateRequest request) {
        User user = findUser(id);

        String email = request.getEmail() == null ? null : normalizeEmail(request.getEmail());
        if (email != null && email.isBlank()) {
            throw new BadRequestException("Email cannot be blank");
        }
        if (email != null && !email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("User", "email", email);
        }

        RoleName requestedRole = request.getRole();
        if (requestedRole != null) {
            validateRoleConsistency(user.getId(), requestedRole);
            user.setRole(findRole(requestedRole));
        }

        if (email != null) {
            user.setEmail(email);
        }

        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        return toResponse(userRepository.save(user));
    }

    public UserAdminResponse updateStatus(UUID id, UserStatusUpdateRequest request) {
        User user = findUser(id);
        user.setActive(request.getActive());
        return toResponse(userRepository.save(user));
    }

    public void delete(UUID id) {
        User user = findUser(id);

        boolean hasDoctorProfile = doctorProfileRepository.existsByUser_Id(id);
        boolean hasPatientProfile = patientProfileRepository.existsByUser_Id(id);

        if (hasDoctorProfile || hasPatientProfile) {
            throw new BadRequestException("Cannot delete a user that is linked to a doctor or patient profile.");
        }

        userRepository.delete(user);
    }

    private void validateRoleConsistency(UUID userId, RoleName requestedRole) {
        boolean hasDoctorProfile = doctorProfileRepository.existsByUser_Id(userId);
        boolean hasPatientProfile = patientProfileRepository.existsByUser_Id(userId);

        if (hasDoctorProfile && requestedRole != RoleName.DOCTOR) {
            throw new BadRequestException("User is linked to a doctor profile, so role must remain DOCTOR.");
        }

        if (hasPatientProfile && requestedRole != RoleName.PATIENT) {
            throw new BadRequestException("User is linked to a patient profile, so role must remain PATIENT.");
        }
    }

    private UserAdminResponse toResponse(User user) {
        DoctorProfile doctorProfile = doctorProfileRepository.findByUser_Id(user.getId()).orElse(null);
        PatientProfile patientProfile = patientProfileRepository.findByUser_Id(user.getId()).orElse(null);
        return UserAdminResponse.from(user, doctorProfile, patientProfile);
    }

    private User findUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private Role findRole(RoleName roleName) {
        return roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName.name()));
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
