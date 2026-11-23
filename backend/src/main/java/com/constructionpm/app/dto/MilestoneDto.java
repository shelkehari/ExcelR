package com.constructionpm.app.dto;

import com.constructionpm.app.entity.ProjectMilestone;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MilestoneDto {
    private Long id;
    private Long projectId;
    @NotBlank
    private String name;
    private String description;
    @NotNull
    private LocalDate plannedDate;
    private LocalDate completedDate;
    private ProjectMilestone.MilestoneStatus status;
    private Integer completionPercentage;
    private Integer sequenceOrder;
    private LocalDateTime createdAt;
}
