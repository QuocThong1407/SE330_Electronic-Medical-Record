package com.emr.emr_system.modules.department.dto;

import com.emr.emr_system.modules.department.entity.Department;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class DepartmentResponse {
    private UUID id;
    private String code;
    private String name;
    private String description;
    private String location;
    private String phoneExt;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DepartmentResponse from(Department department) {
        return DepartmentResponse.builder()
                .id(department.getId())
                .code(department.getCode())
                .name(department.getName())
                .description(department.getDescription())
                .location(department.getLocation())
                .phoneExt(department.getPhoneExt())
                .active(department.getActive())
                .createdAt(department.getCreatedAt())
                .updatedAt(department.getUpdatedAt())
                .build();
    }
}
