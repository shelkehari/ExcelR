package com.constructionpm.app.dto;

import com.constructionpm.app.entity.Project;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class ProjectDto {
    private Long id;
    private String name;
    private String description;
    private String location;
    private String clientName;
    private UserDto projectManager;
    private LocalDate startDate;
    private LocalDate plannedEndDate;
    private LocalDate actualEndDate;
    private BigDecimal totalBudget;
    private Project.ProjectStatus status;
    private Integer progressPercentage;
    private List<MilestoneDto> milestones;
    private BigDecimal totalExpenses;
    private Long activeWorkers;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
