package com.constructionpm.app.dto;

import com.constructionpm.app.entity.MaterialTransaction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MaterialTransactionDto {
    private Long id;
    @NotNull private Long materialId;
    private String materialName;
    private Long projectId;
    private String projectName;
    @NotNull private MaterialTransaction.TransactionType type;
    @NotNull @Positive private BigDecimal quantity;
    private BigDecimal unitCost;
    private String notes;
    private LocalDateTime createdAt;
}
