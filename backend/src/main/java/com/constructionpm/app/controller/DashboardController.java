package com.constructionpm.app.controller;

import com.constructionpm.app.dto.DashboardDto;
import com.constructionpm.app.dto.NotificationDto;
import com.constructionpm.app.entity.Notification;
import com.constructionpm.app.entity.User;
import com.constructionpm.app.repository.*;
import com.constructionpm.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ProjectRepository projectRepo;
    private final WorkerRepository workerRepo;
    private final WorkerAssignmentRepository assignmentRepo;
    private final ExpenseRepository expenseRepo;
    private final MaterialRepository materialRepo;
    private final SiteInspectionRepository inspectionRepo;
    private final EquipmentRepository equipmentRepo;
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<DashboardDto> getDashboard(@AuthenticationPrincipal User user) {
        long totalProjects = projectRepo.count();
        long activeProjects = projectRepo.countByStatus(com.constructionpm.app.entity.Project.ProjectStatus.IN_PROGRESS);
        long completedProjects = projectRepo.countByStatus(com.constructionpm.app.entity.Project.ProjectStatus.COMPLETED);
        long delayedProjects = projectRepo.countByStatus(com.constructionpm.app.entity.Project.ProjectStatus.DELAYED);

        long totalWorkers = workerRepo.countByStatus(com.constructionpm.app.entity.Worker.WorkerStatus.AVAILABLE) +
                workerRepo.countByStatus(com.constructionpm.app.entity.Worker.WorkerStatus.ASSIGNED);
        long assignedWorkers = workerRepo.countByStatus(com.constructionpm.app.entity.Worker.WorkerStatus.ASSIGNED);
        long availableWorkers = workerRepo.countByStatus(com.constructionpm.app.entity.Worker.WorkerStatus.AVAILABLE);

        BigDecimal totalBudget = projectRepo.findAll().stream()
                .map(p -> p.getTotalBudget() != null ? p.getTotalBudget() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpenses = expenseRepo.sumAll() != null ? expenseRepo.sumAll() : BigDecimal.ZERO;

        long lowStockMaterials = materialRepo.findLowStockMaterials().size();
        long pendingInspections = inspectionRepo.countByStatus(com.constructionpm.app.entity.SiteInspection.InspectionStatus.SCHEDULED);
        long equipmentInMaintenance = equipmentRepo.countByStatus(com.constructionpm.app.entity.Equipment.EquipmentStatus.MAINTENANCE);

        List<DashboardDto.ProjectSummaryDto> recentProjects = projectRepo.findActiveProjects().stream()
                .limit(5)
                .map(p -> {
                    BigDecimal projectExpenses = expenseRepo.sumByProjectId(p.getId()) != null ? expenseRepo.sumByProjectId(p.getId()) : BigDecimal.ZERO;
                    return DashboardDto.ProjectSummaryDto.builder()
                            .id(p.getId())
                            .name(p.getName())
                            .location(p.getLocation())
                            .projectManagerName(p.getProjectManager() != null ? p.getProjectManager().getName() : "Unassigned")
                            .status(p.getStatus().name())
                            .progressPercentage(p.getProgressPercentage())
                            .plannedEndDate(p.getPlannedEndDate().toString())
                            .totalBudget(p.getTotalBudget())
                            .totalExpenses(projectExpenses)
                            .build();
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> monthlyExpenses = new ArrayList<>();
        int currentYear = LocalDate.now().getYear();
        List<Object[]> monthlyData = expenseRepo.monthlyExpensesByYear(currentYear);
        for (Object[] data : monthlyData) {
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", data[0]);
            monthData.put("amount", data[1]);
            monthlyExpenses.add(monthData);
        }

        List<DashboardDto.AlertDto> alerts = new ArrayList<>();
        if (delayedProjects > 0) {
            alerts.add(DashboardDto.AlertDto.builder()
                    .type("PROJECT_DELAYED")
                    .message(delayedProjects + " project(s) are delayed")
                    .severity("HIGH")
                    .build());
        }
        if (lowStockMaterials > 0) {
            alerts.add(DashboardDto.AlertDto.builder()
                    .type("LOW_STOCK")
                    .message(lowStockMaterials + " material(s) are running low")
                    .severity("MEDIUM")
                    .build());
        }
        if (equipmentInMaintenance > 0) {
            alerts.add(DashboardDto.AlertDto.builder()
                    .type("EQUIPMENT_MAINTENANCE")
                    .message(equipmentInMaintenance + " equipment item(s) are under maintenance")
                    .severity("MEDIUM")
                    .build());
        }

        DashboardDto dashboard = DashboardDto.builder()
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .completedProjects(completedProjects)
                .delayedProjects(delayedProjects)
                .totalWorkers(totalWorkers)
                .assignedWorkers(assignedWorkers)
                .availableWorkers(availableWorkers)
                .totalBudget(totalBudget)
                .totalExpenses(totalExpenses)
                .lowStockMaterials(lowStockMaterials)
                .pendingInspections(pendingInspections)
                .equipmentInMaintenance(equipmentInMaintenance)
                .recentProjects(recentProjects)
                .monthlyExpenses(monthlyExpenses)
                .alerts(alerts)
                .build();

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationDto>> getNotifications(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getUnreadCount(user.getId()));
    }

    @PostMapping("/notifications/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/notifications/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal User user) {
        notificationService.markAllRead(user.getId());
        return ResponseEntity.noContent().build();
    }
}
