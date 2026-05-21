package com.emr.emr_system.modules.auth.dto.user;

import com.emr.emr_system.modules.auth.entity.RoleName;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UserAdminUpdateRequest {

    @Email(message = "Email should be valid")
    private String email;

    private RoleName role;

    private Boolean active;
}
