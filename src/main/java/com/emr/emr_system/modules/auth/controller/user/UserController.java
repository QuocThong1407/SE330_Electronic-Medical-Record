package com.emr.emr_system.modules.auth.controller.user;

import com.emr.emr_system.modules.auth.dto.user.UserAdminCreateRequest;
import com.emr.emr_system.modules.auth.dto.user.UserAdminResponse;
import com.emr.emr_system.modules.auth.dto.user.UserAdminUpdateRequest;
import com.emr.emr_system.modules.auth.dto.user.UserStatusUpdateRequest;
import com.emr.emr_system.modules.auth.entity.RoleName;
import com.emr.emr_system.modules.auth.service.user.UserService;
import com.emr.emr_system.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @PostMapping
    public ApiResponse<UserAdminResponse> create(@Valid @RequestBody UserAdminCreateRequest request) {
        return ApiResponse.success(userService.create(request), "User created successfully");
    }

    @GetMapping
    public ApiResponse<List<UserAdminResponse>> getAll(
            @RequestParam(required = false) RoleName role,
            @RequestParam(required = false) Boolean active
    ) {
        return ApiResponse.success(userService.getAll(role, active), "User list retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<UserAdminResponse> getById(@PathVariable UUID id) {
        return ApiResponse.success(userService.getById(id), "User retrieved successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<UserAdminResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UserAdminUpdateRequest request
    ) {
        return ApiResponse.success(userService.update(id, request), "User updated successfully");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<UserAdminResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UserStatusUpdateRequest request
    ) {
        return ApiResponse.success(userService.updateStatus(id, request), "User status updated successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        userService.delete(id);
        return ApiResponse.success(null, "User deleted successfully");
    }
}
