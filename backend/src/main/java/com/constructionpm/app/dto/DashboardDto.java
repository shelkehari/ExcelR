package com.constructionpm.app.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder
public class DashboardDto {
    private long totalProjects;
    private long activeProjects;
    private long completedProjects;
    private long delayedProjects;
    private long totalWorkers;
    private long assignedWorkers;
    private long availableWorkers;
    private BigDecimal totalBudget;
    private BigDecimal totalExpenses;
    private long lowStockMaterials;
    private long pendingInspections;
    private long equipmentInMaintenance;
    private List<ProjectSummaryDto> recentProjects;
    private List<Map<String, Object>> monthlyExpenses;
    private List<AlertDto> alerts;

    @Data @Builder
    public static class ProjectSummaryDto {
        private Long id;
        private String name;
        private String location;
        private String projectManagerName;
        private String status;
        private Integer progressPercentage;
        private String plannedEndDate;
        private BigDecimal totalBudget;
        private BigDecimal totalExpenses;
    }

    @Data @Builder
    public static class AlertDto {
        private String type;
        private String message;
        private String severity;
        private Long referenceId;
    }
}
