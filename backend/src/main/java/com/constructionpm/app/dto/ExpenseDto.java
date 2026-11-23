package com.constructionpm.app.dto;

import com.constructionpm.app.entity.Expense;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ExpenseDto {
    private Long id;
    private Long projectId;
    private String projectName;
    @NotBlank private String description;
    @NotNull private Expense.ExpenseCategory category;
    @NotNull @Positive private BigDecimal amount;
    @NotNull private LocalDate expenseDate;
    private String vendor;
    private String referenceNumber;
    private LocalDateTime createdAt;
}
