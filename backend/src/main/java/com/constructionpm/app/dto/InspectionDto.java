package com.constructionpm.app.dto;

import com.constructionpm.app.entity.SiteInspection;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class InspectionDto {
    private Long id;
    @NotNull private Long projectId;
    private String projectName;
    private Long inspectorId;
    private String inspectorName;
    @NotBlank private String title;
    @NotNull private LocalDate scheduledDate;
    private LocalDate completedDate;
    private SiteInspection.InspectionStatus status;
    private String observations;
    private String recommendations;
    private List<IssueDto> issues;
    private LocalDateTime createdAt;

    @Data
    public static class IssueDto {
        private Long id;
        @NotBlank private String title;
        private String description;
        private com.constructionpm.app.entity.InspectionIssue.IssueSeverity severity;
        private com.constructionpm.app.entity.InspectionIssue.IssueStatus status;
        private String resolution;
    }
}
