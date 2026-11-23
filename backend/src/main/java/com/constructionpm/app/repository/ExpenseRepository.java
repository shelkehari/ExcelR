package com.constructionpm.app.repository;

import com.constructionpm.app.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByProjectIdOrderByExpenseDateDesc(Long projectId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.project.id = :projectId")
    BigDecimal sumByProjectId(Long projectId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e")
    BigDecimal sumAll();

    @Query("SELECT e.category, COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.project.id = :projectId GROUP BY e.category")
    List<Object[]> sumByProjectGroupedByCategory(Long projectId);

    @Query("SELECT MONTH(e.expenseDate), COALESCE(SUM(e.amount), 0) FROM Expense e WHERE YEAR(e.expenseDate) = :year GROUP BY MONTH(e.expenseDate)")
    List<Object[]> monthlyExpensesByYear(int year);
}
