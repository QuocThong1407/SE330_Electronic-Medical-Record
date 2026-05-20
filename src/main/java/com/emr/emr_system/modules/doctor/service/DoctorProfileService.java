package com.emr.emr_system.modules.doctor.service;

import com.emr.emr_system.modules.auth.entity.RoleName;
import com.emr.emr_system.modules.auth.entity.User;
import com.emr.emr_system.modules.auth.repository.UserRepository;
import com.emr.emr_system.modules.auth.security.UserPrincipal;
import com.emr.emr_system.modules.doctor.dto.DoctorAdminCreateRequest;
import com.emr.emr_system.modules.doctor.dto.DoctorProfileRequest;
import com.emr.emr_system.modules.doctor.dto.DoctorProfileResponse;
import com.emr.emr_system.modules.doctor.entity.DoctorProfile;
import com.emr.emr_system.modules.doctor.repository.DoctorProfileRepository;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorProfileService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public DoctorProfileResponse createMyProfile(UserPrincipal principal, DoctorProfileRequest request) {
        User user = loadCurrentUser(principal);
        ensureAllowed(user);
        return createProfileForUser(user, request.getDepartmentId(), request.getFullName(), request.getGender(),
                request.getPhone(), request.getEmailContact(), request.getDegree(), request.getExperienceYears(),
                request.getDateOfBirth());
    }

    public DoctorProfileResponse createDoctorByAdmin(DoctorAdminCreateRequest request) {
        User user = loadUserById(request.getUserId());
        ensureRole(user, RoleName.DOCTOR);
        return createProfileForUser(user, request.getDepartmentId(), request.getFullName(), request.getGender(),
                request.getPhone(), request.getEmailContact(), request.getDegree(), request.getExperienceYears(),
                request.getDateOfBirth());
    }

    public DoctorProfileResponse updateMyProfile(UserPrincipal principal, DoctorProfileRequest request) {
        User user = loadCurrentUser(principal);
        ensureAllowed(user);

        DoctorProfile profile = doctorProfileRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile", "userId", user.getId()));

        profile.setDepartmentId(request.getDepartmentId());
        profile.setFullName(request.getFullName());
        profile.setGender(request.getGender());
        profile.setPhone(request.getPhone());
        profile.setEmailContact(request.getEmailContact());
        profile.setDegree(request.getDegree());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setDateOfBirth(request.getDateOfBirth());

        return DoctorProfileResponse.from(doctorProfileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public DoctorProfileResponse getMyProfile(UserPrincipal principal) {
        User user = loadCurrentUser(principal);
        DoctorProfile profile = doctorProfileRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile", "userId", user.getId()));
        return DoctorProfileResponse.from(profile);
    }

    @Transactional(readOnly = true)
    public List<DoctorProfileResponse> getAllDoctors() {
        return doctorProfileRepository.findAll()
                .stream()
                .map(DoctorProfileResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DoctorProfileResponse getDoctorById(UUID id) {
        DoctorProfile profile = doctorProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile", "id", id));
        return DoctorProfileResponse.from(profile);
    }

    public DoctorProfileResponse updateDoctorById(UUID id, DoctorProfileRequest request) {
        DoctorProfile profile = doctorProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile", "id", id));

        profile.setDepartmentId(request.getDepartmentId());
        profile.setFullName(request.getFullName());
        profile.setGender(request.getGender());
        profile.setPhone(request.getPhone());
        profile.setEmailContact(request.getEmailContact());
        profile.setDegree(request.getDegree());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setDateOfBirth(request.getDateOfBirth());

        return DoctorProfileResponse.from(doctorProfileRepository.save(profile));
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
        if (roleName != RoleName.DOCTOR && roleName != RoleName.ADMIN) {
            throw new AccessDeniedException("Only DOCTOR or ADMIN users can create doctor profiles");
        }
    }

    private void ensureRole(User user, RoleName expectedRole) {
        if (user.getRole().getName() != expectedRole) {
            throw new AccessDeniedException("Target user must have role " + expectedRole);
        }
    }

    private DoctorProfileResponse createProfileForUser(
            User user,
            UUID departmentId,
            String fullName,
            com.emr.emr_system.shared.enums.Gender gender,
            String phone,
            String emailContact,
            String degree,
            Integer experienceYears,
            java.time.LocalDate dateOfBirth
    ) {
        if (doctorProfileRepository.existsByUser_Id(user.getId())) {
            throw new DuplicateResourceException("Doctor profile", "userId", user.getId());
        }

        DoctorProfile profile = DoctorProfile.builder()
                .user(user)
                .departmentId(departmentId)
                .employeeCode(generateUniqueEmployeeCode())
                .fullName(fullName)
                .gender(gender)
                .phone(phone)
                .emailContact(emailContact)
                .degree(degree)
                .experienceYears(experienceYears)
                .dateOfBirth(dateOfBirth)
                .build();

        return DoctorProfileResponse.from(doctorProfileRepository.save(profile));
    }

    private String generateUniqueEmployeeCode() {
        String code;
        do {
            code = "DOC-" + LocalDate.now().getYear() + "-" + (1000 + secureRandom.nextInt(9000));
        } while (doctorProfileRepository.existsByEmployeeCode(code));
        return code;
    }
}
