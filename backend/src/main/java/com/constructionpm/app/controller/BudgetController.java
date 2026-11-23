package com.constructionpm.app.controller;

import com.constructionpm.app.dto.ExpenseDto;
import com.constructionpm.app.entity.User;
import com.constructionpm.app.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping("/projects/{projectId}/expenses")
    public ResponseEntity<List<ExpenseDto>> getProjectExpenses(@PathVariable Long projectId) {
        return ResponseEntity.ok(budgetService.getProjectExpenses(projectId));
    }

    @PostMapping("/expenses")
    public ResponseEntity<ExpenseDto> recordExpense(@Valid @RequestBody ExpenseDto dto,
                                                    @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(budgetService.recordExpense(dto, user));
    }

    @PutMapping("/expenses/{id}")
    public ResponseEntity<ExpenseDto> updateExpense(@PathVariable Long id, @Valid @RequestBody ExpenseDto dto) {
        return ResponseEntity.ok(budgetService.updateExpense(id, dto));
    }

    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        budgetService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/projects/{projectId}/summary")
    public ResponseEntity<Map<String, Object>> getBudgetSummary(@PathVariable Long projectId) {
        return ResponseEntity.ok(budgetService.getBudgetSummary(projectId));
    }
}
