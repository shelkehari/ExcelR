package com.constructionpm.app.controller;

import com.constructionpm.app.dto.ProjectDto;
import com.constructionpm.app.service.BudgetService;
import com.constructionpm.app.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ProjectService projectService;
    private final BudgetService budgetService;

    @GetMapping("/projects/{id}/pdf")
    public ResponseEntity<byte[]> generateProjectReport(@PathVariable Long id) {
        ProjectDto project = projectService.getProject(id);
        Map<String, Object> budget = budgetService.getBudgetSummary(id);

        String html = buildReportHtml(project, budget);
        byte[] pdfBytes = html.getBytes();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_HTML);
        headers.setContentDispositionFormData("attachment",
                "report-" + project.getName().replaceAll("\\s+", "-") + ".html");

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }

    private String buildReportHtml(ProjectDto project, Map<String, Object> budget) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        BigDecimal totalBudget = (BigDecimal) budget.get("totalBudget");
        BigDecimal totalExpenses = (BigDecimal) budget.get("totalExpenses");
        BigDecimal remaining = (BigDecimal) budget.get("remainingBudget");
        BigDecimal utilization = (BigDecimal) budget.get("utilizationPercentage");

        long completedMilestones = project.getMilestones().stream()
                .filter(m -> m.getStatus().name().equals("COMPLETED")).count();

        StringBuilder sb = new StringBuilder();
        sb.append("""
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <title>Project Report</title>
            <style>
              body { font-family: Arial, sans-serif; color: #1E293B; margin: 40px; font-size: 13px; }
              h1 { color: #2563EB; font-size: 22px; margin-bottom: 4px; }
              h2 { font-size: 14px; color: #1E293B; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; margin-top: 24px; }
              .meta { color: #64748B; font-size: 12px; margin-bottom: 24px; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
              .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; }
              .label { font-size: 11px; color: #64748B; }
              .value { font-size: 15px; font-weight: 600; margin-top: 2px; }
              table { width: 100%; border-collapse: collapse; margin-top: 8px; }
              th { text-align: left; padding: 8px 10px; background: #F8FAFC; font-size: 11px; color: #64748B; text-transform: uppercase; border-bottom: 1px solid #E2E8F0; }
              td { padding: 8px 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; }
              .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
              .badge-success { background: #dcfce7; color: #16A34A; }
              .badge-warning { background: #fef9c3; color: #D97706; }
              .badge-danger { background: #fee2e2; color: #DC2626; }
              .badge-info { background: #dbeafe; color: #2563EB; }
              .badge-neutral { background: #f1f5f9; color: #64748B; }
              .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 11px; }
            </style>
            </head>
            <body>
            """);

        sb.append("<h1>").append(project.getName()).append("</h1>");
        sb.append("<p class='meta'>Project Progress Report &nbsp;·&nbsp; Generated: ")
          .append(LocalDate.now().format(fmt)).append("</p>");

        sb.append("<h2>Project Overview</h2>");
        sb.append("<div class='grid'>");
        appendCard(sb, "Location", project.getLocation());
        appendCard(sb, "Client", project.getClientName());
        appendCard(sb, "Project Manager", project.getProjectManager() != null ? project.getProjectManager().getName() : "Unassigned");
        appendCard(sb, "Status", project.getStatus().name().replace("_", " "));
        appendCard(sb, "Start Date", project.getStartDate().format(fmt));
        appendCard(sb, "Planned End Date", project.getPlannedEndDate().format(fmt));
        appendCard(sb, "Overall Progress", project.getProgressPercentage() + "%");
        appendCard(sb, "Active Workers", String.valueOf(project.getActiveWorkers()));
        sb.append("</div>");

        sb.append("<h2>Budget Summary</h2>");
        sb.append("<div class='grid'>");
        appendCard(sb, "Total Budget", "$" + totalBudget.setScale(2, RoundingMode.HALF_UP));
        appendCard(sb, "Total Expenses", "$" + totalExpenses.setScale(2, RoundingMode.HALF_UP));
        appendCard(sb, "Remaining Budget", "$" + remaining.setScale(2, RoundingMode.HALF_UP));
        appendCard(sb, "Budget Utilization", utilization + "%");
        sb.append("</div>");

        if (!project.getMilestones().isEmpty()) {
            sb.append("<h2>Milestones (").append(completedMilestones).append("/").append(project.getMilestones().size()).append(" completed)</h2>");
            sb.append("<table><thead><tr><th>#</th><th>Milestone</th><th>Planned Date</th><th>Status</th><th>Completion</th></tr></thead><tbody>");
            project.getMilestones().stream()
                .sorted((a, b) -> a.getSequenceOrder() - b.getSequenceOrder())
                .forEach(m -> {
                    String badgeClass = switch (m.getStatus().name()) {
                        case "COMPLETED" -> "badge-success";
                        case "IN_PROGRESS" -> "badge-info";
                        case "DELAYED" -> "badge-danger";
                        default -> "badge-neutral";
                    };
                    sb.append("<tr>")
                      .append("<td>").append(m.getSequenceOrder()).append("</td>")
                      .append("<td>").append(m.getName()).append("</td>")
                      .append("<td>").append(m.getPlannedDate().format(fmt)).append("</td>")
                      .append("<td><span class='badge ").append(badgeClass).append("'>").append(m.getStatus().name().replace("_", " ")).append("</span></td>")
                      .append("<td>").append(m.getCompletionPercentage()).append("%</td>")
                      .append("</tr>");
                });
            sb.append("</tbody></table>");
        }

        if (project.getDescription() != null && !project.getDescription().isBlank()) {
            sb.append("<h2>Description</h2><p>").append(project.getDescription()).append("</p>");
        }

        sb.append("<div class='footer'>ConstructPM &nbsp;·&nbsp; Smart Construction Project Management Platform &nbsp;·&nbsp; ")
          .append(LocalDate.now().format(fmt)).append("</div>");
        sb.append("</body></html>");
        return sb.toString();
    }

    private void appendCard(StringBuilder sb, String label, String value) {
        sb.append("<div class='card'><div class='label'>").append(label)
          .append("</div><div class='value'>").append(value).append("</div></div>");
    }
}
