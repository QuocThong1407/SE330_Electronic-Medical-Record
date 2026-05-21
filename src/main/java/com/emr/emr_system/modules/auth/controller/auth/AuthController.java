package com.emr.emr_system.modules.auth.controller.auth;

import com.emr.emr_system.modules.auth.dto.auth.AuthResponse;
import com.emr.emr_system.modules.auth.dto.auth.LoginRequest;
import com.emr.emr_system.modules.auth.dto.auth.RegisterRequest;
import com.emr.emr_system.modules.auth.dto.user.UserResponse;
import com.emr.emr_system.modules.auth.security.UserPrincipal;
import com.emr.emr_system.modules.auth.service.auth.AuthService;
import com.emr.emr_system.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request), "User registered successfully");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request), "Login successful");
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(authService.getCurrentUser(principal.getUsername()), "Current user retrieved successfully");
    }
}
