package com.constructionpm.app.service;

import com.constructionpm.app.dto.DelayPredictionDto;
import com.constructionpm.app.entity.Project;
import com.constructionpm.app.entity.ProjectMilestone;
import com.constructionpm.app.exception.ResourceNotFoundException;
import com.constructionpm.app.repository.ProjectMilestoneRepository;
import com.constructionpm.app.repository.ProjectProgressRepository;
import com.constructionpm.app.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DelayPredictionService {

    private final ProjectRepository projectRepo;
    private final ProjectMilestoneRepository milestoneRepo;
    private final ProjectProgressRepository progressRepo;

    public DelayPredictionDto predict(Long projectId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        LocalDate today = LocalDate.now();
        LocalDate start = project.getStartDate();
        LocalDate plannedEnd = project.getPlannedEndDate();

        long totalDays = ChronoUnit.DAYS.between(start, plannedEnd);
        long elapsedDays = ChronoUnit.DAYS.between(start, today);
        int currentProgress = project.getProgressPercentage();

        // Expected progress based on elapsed time
        double expectedProgress = totalDays > 0 ? Math.min(100.0, (double) elapsedDays / totalDays * 100) : 0;
        double progressDiff = currentProgress - expectedProgress;

        // Milestone analysis
        List<ProjectMilestone> milestones = milestoneRepo.findByProjectIdOrderBySequenceOrder(projectId);
        long delayedMilestones = milestones.stream()
                .filter(m -> m.getStatus() == ProjectMilestone.MilestoneStatus.DELAYED ||
                        (m.getStatus() != ProjectMilestone.MilestoneStatus.COMPLETED && m.getPlannedDate().isBefore(today)))
                .count();
        long completedMilestones = milestones.stream()
                .filter(m -> m.getStatus() == ProjectMilestone.MilestoneStatus.COMPLETED).count();

        // Estimate completion date
        LocalDate estimatedEnd;
        int estimatedRemainingDays;
        int delayDays = 0;

        if (currentProgress >= 100) {
            estimatedEnd = project.getActualEndDate() != null ? project.getActualEndDate() : today;
            estimatedRemainingDays = 0;
        } else if (currentProgress == 0 || elapsedDays <= 0) {
            estimatedEnd = plannedEnd;
            estimatedRemainingDays = (int) ChronoUnit.DAYS.between(today, plannedEnd);
        } else {
            // Rate-based estimation: days per percent
            double daysPerPercent = (double) elapsedDays / currentProgress;
            int remainingPercent = 100 - currentProgress;
            estimatedRemainingDays = (int) Math.ceil(daysPerPercent * remainingPercent);
            estimatedEnd = today.plusDays(estimatedRemainingDays);
        }

        if (estimatedEnd.isAfter(plannedEnd)) {
            delayDays = (int) ChronoUnit.DAYS.between(plannedEnd, estimatedEnd);
        }

        // Risk factors
        List<String> riskFactors = new ArrayList<>();
        if (progressDiff < -10) riskFactors.add("Progress is " + String.format("%.1f", Math.abs(progressDiff)) + "% behind schedule");
        if (delayedMilestones > 0) riskFactors.add(delayedMilestones + " milestone(s) are delayed or overdue");
        if (project.getStatus() == Project.ProjectStatus.ON_HOLD) riskFactors.add("Project is currently on hold");
        if (elapsedDays > totalDays * 0.9 && currentProgress < 80) riskFactors.add("Over 90% of planned duration elapsed with less than 80% completion");

        // Risk level
        String delayRisk;
        if (delayDays == 0 && progressDiff >= -5) {
            delayRisk = "LOW";
        } else if (delayDays <= 14 || (progressDiff >= -15 && delayedMilestones <= 1)) {
            delayRisk = "MEDIUM";
        } else {
            delayRisk = "HIGH";
        }

        String summary = buildSummary(delayRisk, delayDays, currentProgress, expectedProgress);

        return DelayPredictionDto.builder()
                .projectId(projectId).projectName(project.getName())
                .plannedEndDate(plannedEnd).estimatedEndDate(estimatedEnd)
                .estimatedRemainingDays(estimatedRemainingDays).delayDays(delayDays)
                .delayRisk(delayRisk).currentProgress(currentProgress)
                .expectedProgress(Math.round(expectedProgress * 10.0) / 10.0)
                .progressDifference(Math.round(progressDiff * 10.0) / 10.0)
                .modelType("RULE_BASED_ESTIMATION")
                .riskFactors(riskFactors).summary(summary)
                .build();
    }

    private String buildSummary(String risk, int delayDays, int current, double expected) {
        return switch (risk) {
            case "LOW" -> "Project is on track. Current progress aligns with the planned schedule.";
            case "MEDIUM" -> delayDays > 0
                    ? "Project may be delayed by approximately " + delayDays + " days. Monitor closely."
                    : "Project shows minor schedule variance. Attention recommended.";
            case "HIGH" -> "Project is at high risk of significant delay (" + delayDays + " days). Immediate action required.";
            default -> "Insufficient data for accurate prediction.";
        };
    }
}
