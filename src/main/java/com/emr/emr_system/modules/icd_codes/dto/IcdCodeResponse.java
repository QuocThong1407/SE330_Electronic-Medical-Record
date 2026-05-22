package com.emr.emr_system.modules.icd_codes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IcdCodeResponse {
    private String id;
    private String name;
    private String category;
    private String description;
}
