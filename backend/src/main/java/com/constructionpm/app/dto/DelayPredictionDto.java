package com.constructionpm.app.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data @Builder
public class DelayPredictionDto {
    private Long projectId;
    private String projectName;
    private LocalDate plannedEndDate;
    private LocalDate estimatedEndDate;
    private Integer estimatedRemainingDays;
    private Integer delayDays;
    private String delayRisk;
    private Integer currentProgress;
    private Double expectedProgress;
    private Double progressDifference;
    private String modelType;
    private List<String> riskFactors;
    private String summary;
}
