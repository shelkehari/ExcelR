package com.constructionpm.app.service;

import com.constructionpm.app.dto.ExpenseDto;
import com.constructionpm.app.entity.*;
import com.constructionpm.app.exception.ResourceNotFoundException;
import com.constructionpm.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BudgetService {

    private final ExpenseRepository expenseRepo;
    private final ProjectBudgetRepository budgetRepo;
    private final ProjectRepository projectRepo;
    private final NotificationService notificationService;

    public List<ExpenseDto> getProjectExpenses(Long projectId) {
        return expenseRepo.findByProjectIdOrderByExpenseDateDesc(projectId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ExpenseDto recordExpense(ExpenseDto dto, User user) {
        Project project = projectRepo.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", dto.getProjectId()));
        Expense expense = Expense.builder()
                .project(project).recordedBy(user).description(dto.getDescription())
                .category(dto.getCategory()).amount(dto.getAmount())
                .expenseDate(dto.getExpenseDate()).vendor(dto.getVendor())
                .referenceNumber(dto.getReferenceNumber()).build();
        expenseRepo.save(expense);

        checkBudgetAlert(project);
        return toDto(expense);
    }

    @Transactional
    public ExpenseDto updateExpense(Long id, ExpenseDto dto) {
        Expense expense = expenseRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", id));
        expense.setDescription(dto.getDescription()); expense.setCategory(dto.getCategory());
        expense.setAmount(dto.getAmount()); expense.setExpenseDate(dto.getExpenseDate());
        expense.setVendor(dto.getVendor()); expense.setReferenceNumber(dto.getReferenceNumber());
        return toDto(expenseRepo.save(expense));
    }

    @Transactional
    public void deleteExpense(Long id) {
        expenseRepo.deleteById(id);
    }

    public Map<String, Object> getBudgetSummary(Long projectId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        BigDecimal totalExpenses = expenseRepo.sumByProjectId(projectId);
        BigDecimal remaining = project.getTotalBudget().subtract(totalExpenses);
        BigDecimal utilization = project.getTotalBudget().compareTo(BigDecimal.ZERO) > 0 ?
                totalExpenses.multiply(BigDecimal.valueOf(100)).divide(project.getTotalBudget(), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        List<Object[]> categoryBreakdown = expenseRepo.sumByProjectGroupedByCategory(projectId);
        Map<String, BigDecimal> byCategory = new LinkedHashMap<>();
        categoryBreakdown.forEach(row -> byCategory.put(row[0].toString(), (BigDecimal) row[1]));

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalBudget", project.getTotalBudget());
        summary.put("totalExpenses", totalExpenses);
        summary.put("remainingBudget", remaining);
        summary.put("utilizationPercentage", utilization);
        summary.put("byCategory", byCategory);
        return summary;
    }

    private void checkBudgetAlert(Project project) {
        BigDecimal totalExpenses = expenseRepo.sumByProjectId(project.getId());
        Optional<ProjectBudget> budgetOpt = budgetRepo.findByProjectId(project.getId());
        int threshold = budgetOpt.map(ProjectBudget::getAlertThresholdPercentage).orElse(80);
        if (project.getTotalBudget().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal utilization = totalExpenses.multiply(BigDecimal.valueOf(100))
                    .divide(project.getTotalBudget(), 2, RoundingMode.HALF_UP);
            if (utilization.intValue() >= threshold) {
                notificationService.createSystemNotification(
                        "Budget Alert",
                        "Project '" + project.getName() + "' has used " + utilization + "% of its budget.",
                        Notification.NotificationType.BUDGET_EXCEEDED, Notification.NotificationPriority.HIGH, project.getId()
                );
            }
        }
    }

    private ExpenseDto toDto(Expense e) {
        ExpenseDto dto = new ExpenseDto();
        dto.setId(e.getId()); dto.setProjectId(e.getProject().getId());
        dto.setProjectName(e.getProject().getName()); dto.setDescription(e.getDescription());
        dto.setCategory(e.getCategory()); dto.setAmount(e.getAmount());
        dto.setExpenseDate(e.getExpenseDate()); dto.setVendor(e.getVendor());
        dto.setReferenceNumber(e.getReferenceNumber()); dto.setCreatedAt(e.getCreatedAt());
        return dto;
    }
}
