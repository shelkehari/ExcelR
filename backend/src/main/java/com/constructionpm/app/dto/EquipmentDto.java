package com.constructionpm.app.dto;

import com.constructionpm.app.entity.Equipment;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EquipmentDto {
    private Long id;
    @NotBlank private String name;
    @NotBlank private String equipmentCode;
    @NotBlank private String category;
    private String model;
    private String manufacturer;
    private Equipment.EquipmentStatus status;
    private Long currentProjectId;
    private String currentProjectName;
    private String location;
    private String notes;
    private boolean active;
    private LocalDateTime createdAt;
}
