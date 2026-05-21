package com.emr.emr_system.modules.auth.dto.user;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserStatusUpdateRequest {

    @NotNull(message = "Active status is required")
    private Boolean active;
}
