package com.emr.emr_system.modules.icd_codes.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "icd_codes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IcdCode {
    @Id
    @Column(name = "id", length = 10)
    private String id;

    @Column(name = "name", nullable = false, length = 300)
    private String name;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "description")
    private String description;
}
