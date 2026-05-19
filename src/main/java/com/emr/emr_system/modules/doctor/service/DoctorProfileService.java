package com.emr.emr_system.modules.doctor.service;

import com.emr.emr_system.modules.auth.entity.RoleName;
import com.emr.emr_system.modules.auth.entity.User;
import com.emr.emr_system.modules.auth.repository.UserRepository;
import com.emr.emr_system.modules.auth.security.UserPrincipal;
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

        if (doctorProfileRepository.existsByUser_Id(user.getId())) {
            throw new DuplicateResourceException("Doctor profile", "userId", user.getId());
        }

        DoctorProfile profile = DoctorProfile.builder()
                .user(user)
                .departmentId(request.getDepartmentId())
                .employeeCode(generateUniqueEmployeeCode())
                .fullName(request.getFullName())
                .gender(request.getGender())
                .phone(request.getPhone())
                .emailContact(request.getEmailContact())
                .degree(request.getDegree())
                .experienceYears(request.getExperienceYears())
                .dateOfBirth(request.getDateOfBirth())
                .build();

        return DoctorProfileResponse.from(doctorProfileRepository.save(profile));
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

    private User loadCurrentUser(UserPrincipal principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", principal.getUsername()));
    }

    private void ensureAllowed(User user) {
        RoleName roleName = user.getRole().getName();
        if (roleName != RoleName.DOCTOR && roleName != RoleName.ADMIN) {
            throw new AccessDeniedException("Only DOCTOR or ADMIN users can create doctor profiles");
        }
    }

    private String generateUniqueEmployeeCode() {
        String code;
        do {
            code = "DOC-" + LocalDate.now().getYear() + "-" + (1000 + secureRandom.nextInt(9000));
        } while (doctorProfileRepository.existsByEmployeeCode(code));
        return code;
    }
}
