package com.emr.emr_system.modules.auth.db;

import com.emr.emr_system.modules.auth.entity.Role;
import com.emr.emr_system.modules.auth.entity.RoleName;
import com.emr.emr_system.modules.auth.entity.User;
import com.emr.emr_system.modules.auth.repository.RoleRepository;
import com.emr.emr_system.modules.auth.repository.UserRepository;
import com.emr.emr_system.modules.doctor.entity.DoctorProfile;
import com.emr.emr_system.modules.doctor.repository.DoctorProfileRepository;
import com.emr.emr_system.modules.patient.entity.PatientProfile;
import com.emr.emr_system.modules.patient.repository.PatientProfileRepository;
import com.emr.emr_system.shared.enums.Gender;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.seed.doctor.email}")
    private String doctorEmail;

    @Value("${app.seed.doctor.password}")
    private String doctorPassword;

    @Value("${app.seed.patient.email}")
    private String patientEmail;

    @Value("${app.seed.patient.password}")
    private String patientPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedAdmin();
        seedDoctor();
        seedPatient();
    }

    private void seedAdmin() {
        String normalizedEmail = normalizeEmail(adminEmail);
        Role adminRole = findRole(RoleName.ADMIN);
        seedUser(normalizedEmail, adminPassword, adminRole);
        log.info("Admin seed checked: {}", normalizedEmail);
    }

    private void seedDoctor() {
        String normalizedEmail = normalizeEmail(doctorEmail);
        Role doctorRole = findRole(RoleName.DOCTOR);
        User doctorUser = seedUser(normalizedEmail, doctorPassword, doctorRole);

        if (!doctorProfileRepository.existsByUser_Id(doctorUser.getId())) {
            DoctorProfile profile = DoctorProfile.builder()
                    .user(doctorUser)
                    .employeeCode("DOC-0001")
                    .fullName("Dr. Nguyen Van A")
                    .gender(Gender.MALE)
                    .experienceYears(5)
                    .build();

            doctorProfileRepository.save(profile);
            log.info("Seeded doctor profile: {}", normalizedEmail);
        } else {
            log.info("Doctor profile already exists for: {}", normalizedEmail);
        }
    }

    private void seedPatient() {
        String normalizedEmail = normalizeEmail(patientEmail);
        Role patientRole = findRole(RoleName.PATIENT);
        User patientUser = seedUser(normalizedEmail, patientPassword, patientRole);

        if (!patientProfileRepository.existsByUser_Id(patientUser.getId())) {
            PatientProfile profile = PatientProfile.builder()
                    .user(patientUser)
                    .patientCode("PAT-0001")
                    .fullName("Tran Thi B")
                    .gender(Gender.FEMALE)
                    .dateOfBirth(LocalDate.of(2000, 1, 1))
                    .build();

            patientProfileRepository.save(profile);
            log.info("Seeded patient profile: {}", normalizedEmail);
        } else {
            log.info("Patient profile already exists for: {}", normalizedEmail);
        }
    }

    private User seedUser(String email, String rawPassword, Role role) {
        return userRepository.findByEmail(email)
                .map(existing -> {
                    existing.setPasswordHash(passwordEncoder.encode(rawPassword));
                    existing.setRole(role);
                    existing.setActive(true);
                    log.info("Updated seeded user: {}", email);
                    return userRepository.save(existing);
                })
                .orElseGet(() -> {
                    User user = User.builder()
                            .email(email)
                            .passwordHash(passwordEncoder.encode(rawPassword))
                            .role(role)
                            .active(true)
                            .build();

                    User saved = userRepository.save(user);
                    log.info("Seeded user: {}", email);
                    return saved;
                });
    }

    private Role findRole(RoleName roleName) {
        return roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName.name()));
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
