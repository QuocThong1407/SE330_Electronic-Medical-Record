package com.emr.emr_system.modules.auth.repository;

import com.emr.emr_system.modules.auth.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = "role")
    Optional<User> findByEmail(String email);

    @Override
    @EntityGraph(attributePaths = "role")
    Optional<User> findById(UUID uuid);

    @Override
    @EntityGraph(attributePaths = "role")
    List<User> findAll();
}
