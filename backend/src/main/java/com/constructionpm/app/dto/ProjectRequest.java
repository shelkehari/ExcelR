package com.constructionpm.app.dto;

import com.constructionpm.app.entity.Project;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProjectRequest {
    @NotBlank
    private String name;
    private String description;
    @NotBlank
    private String location;
    @NotBlank
    private String clientName;
    private Long projectManagerId;
    @NotNull
    private LocalDate startDate;
    @NotNull
    private LocalDate plannedEndDate;
    @NotNull @Positive
    private BigDecimal totalBudget;
    private Project.ProjectStatus status;
}
