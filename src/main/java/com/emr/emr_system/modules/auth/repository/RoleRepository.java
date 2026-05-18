package com.emr.emr_system.modules.auth.repository;

import com.emr.emr_system.modules.auth.entity.Role;
import com.emr.emr_system.modules.auth.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(RoleName name);
}
