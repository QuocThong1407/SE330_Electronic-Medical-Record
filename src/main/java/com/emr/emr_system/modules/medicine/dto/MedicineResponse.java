package com.emr.emr_system.modules.medicine.dto;

import com.emr.emr_system.modules.medicine.entity.Medicine;
import com.emr.emr_system.shared.enums.MedicineUnit;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MedicineResponse {

    private UUID id;
    private UUID categoryId;
    private String categoryName;
    private String code;
    private String name;
    private MedicineUnit unit;
    private String manufacturer;
    private String description;
    private String sideEffects;
    private BigDecimal price;
    private Integer stockQuantity;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MedicineResponse from(Medicine medicine, String categoryName) {
        return MedicineResponse.builder()
                .id(medicine.getId())
                .categoryId(medicine.getCategoryId())
                .categoryName(categoryName)
                .code(medicine.getCode())
                .name(medicine.getName())
                .unit(medicine.getUnit())
                .manufacturer(medicine.getManufacturer())
                .description(medicine.getDescription())
                .sideEffects(medicine.getSideEffects())
                .price(medicine.getPrice())
                .stockQuantity(medicine.getStockQuantity())
                .isActive(medicine.getIsActive())
                .createdAt(medicine.getCreatedAt())
                .updatedAt(medicine.getUpdatedAt())
                .build();
    }
}