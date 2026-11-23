package com.constructionpm.app.dto;

import com.constructionpm.app.entity.Material;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MaterialDto {
    private Long id;
    @NotBlank private String name;
    @NotBlank private String category;
    @NotBlank private String unit;
    private BigDecimal availableQuantity;
    @NotNull private BigDecimal reorderLevel;
    @NotNull private BigDecimal unitCost;
    private String supplier;
    private boolean active;
    private LocalDateTime createdAt;
}
