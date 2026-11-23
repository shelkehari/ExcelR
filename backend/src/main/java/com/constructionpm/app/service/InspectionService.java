package com.constructionpm.app.service;

import com.constructionpm.app.dto.InspectionDto;
import com.constructionpm.app.entity.*;
import com.constructionpm.app.exception.ResourceNotFoundException;
import com.constructionpm.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InspectionService {

    private final SiteInspectionRepository inspectionRepo;
    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;

    public List<InspectionDto> getAllInspections() {
        return inspectionRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<InspectionDto> getProjectInspections(Long projectId) {
        return inspectionRepo.findByProjectIdOrderByScheduledDateDesc(projectId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public InspectionDto getInspection(Long id) {
        return toDto(findById(id));
    }

    @Transactional
    public InspectionDto createInspection(InspectionDto dto) {
        Project project = projectRepo.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", dto.getProjectId()));
        SiteInspection inspection = SiteInspection.builder()
                .project(project).title(dto.getTitle()).scheduledDate(dto.getScheduledDate())
                .status(SiteInspection.InspectionStatus.SCHEDULED)
                .build();
        if (dto.getInspectorId() != null) {
            inspection.setInspector(userRepo.findById(dto.getInspectorId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", dto.getInspectorId())));
        }
        return toDto(inspectionRepo.save(inspection));
    }

    @Transactional
    public InspectionDto updateInspection(Long id, InspectionDto dto) {
        SiteInspection inspection = findById(id);
        inspection.setTitle(dto.getTitle()); inspection.setScheduledDate(dto.getScheduledDate());
        inspection.setObservations(dto.getObservations()); inspection.setRecommendations(dto.getRecommendations());
        if (dto.getStatus() != null) {
            inspection.setStatus(dto.getStatus());
            if (dto.getStatus() == SiteInspection.InspectionStatus.COMPLETED ||
                dto.getStatus() == SiteInspection.InspectionStatus.FAILED) {
                inspection.setCompletedDate(LocalDate.now());
            }
        }
        if (dto.getInspectorId() != null) {
            inspection.setInspector(userRepo.findById(dto.getInspectorId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", dto.getInspectorId())));
        }
        if (dto.getIssues() != null) {
            inspection.getIssues().clear();
            dto.getIssues().forEach(issueDto -> {
                InspectionIssue issue = new InspectionIssue();
                issue.setInspection(inspection); issue.setTitle(issueDto.getTitle());
                issue.setDescription(issueDto.getDescription()); issue.setSeverity(issueDto.getSeverity());
                issue.setStatus(issueDto.getStatus() != null ? issueDto.getStatus() : InspectionIssue.IssueStatus.OPEN);
                issue.setResolution(issueDto.getResolution());
                inspection.getIssues().add(issue);
            });
        }
        return toDto(inspectionRepo.save(inspection));
    }

    private SiteInspection findById(Long id) {
        return inspectionRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Inspection", id));
    }

    private InspectionDto toDto(SiteInspection i) {
        InspectionDto dto = new InspectionDto();
        dto.setId(i.getId()); dto.setProjectId(i.getProject().getId());
        dto.setProjectName(i.getProject().getName());
        if (i.getInspector() != null) {
            dto.setInspectorId(i.getInspector().getId()); dto.setInspectorName(i.getInspector().getName());
        }
        dto.setTitle(i.getTitle()); dto.setScheduledDate(i.getScheduledDate());
        dto.setCompletedDate(i.getCompletedDate()); dto.setStatus(i.getStatus());
        dto.setObservations(i.getObservations()); dto.setRecommendations(i.getRecommendations());
        dto.setIssues(i.getIssues().stream().map(issue -> {
            InspectionDto.IssueDto issueDto = new InspectionDto.IssueDto();
            issueDto.setId(issue.getId()); issueDto.setTitle(issue.getTitle());
            issueDto.setDescription(issue.getDescription()); issueDto.setSeverity(issue.getSeverity());
            issueDto.setStatus(issue.getStatus()); issueDto.setResolution(issue.getResolution());
            return issueDto;
        }).collect(Collectors.toList()));
        dto.setCreatedAt(i.getCreatedAt());
        return dto;
    }
}
