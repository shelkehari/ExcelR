package com.constructionpm.app.service;

import com.constructionpm.app.dto.*;
import com.constructionpm.app.entity.*;
import com.constructionpm.app.exception.ResourceNotFoundException;
import com.constructionpm.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;
    private final ProjectMilestoneRepository milestoneRepo;
    private final ProjectProgressRepository progressRepo;
    private final ExpenseRepository expenseRepo;
    private final WorkerAssignmentRepository assignmentRepo;
    private final NotificationService notificationService;

    public List<ProjectDto> getAllProjects() {
        return projectRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public ProjectDto getProject(Long id) {
        return toDto(findById(id));
    }

    @Transactional
    public ProjectDto createProject(ProjectRequest req) {
        Project project = Project.builder()
                .name(req.getName())
                .description(req.getDescription())
                .location(req.getLocation())
                .clientName(req.getClientName())
                .startDate(req.getStartDate())
                .plannedEndDate(req.getPlannedEndDate())
                .totalBudget(req.getTotalBudget())
                .status(req.getStatus() != null ? req.getStatus() : Project.ProjectStatus.PLANNING)
                .build();

        if (req.getProjectManagerId() != null) {
            project.setProjectManager(userRepo.findById(req.getProjectManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", req.getProjectManagerId())));
        }
        return toDto(projectRepo.save(project));
    }

    @Transactional
    public ProjectDto updateProject(Long id, ProjectRequest req) {
        Project project = findById(id);
        project.setName(req.getName());
        project.setDescription(req.getDescription());
        project.setLocation(req.getLocation());
        project.setClientName(req.getClientName());
        project.setStartDate(req.getStartDate());
        project.setPlannedEndDate(req.getPlannedEndDate());
        project.setTotalBudget(req.getTotalBudget());
        if (req.getStatus() != null) project.setStatus(req.getStatus());
        if (req.getProjectManagerId() != null) {
            project.setProjectManager(userRepo.findById(req.getProjectManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", req.getProjectManagerId())));
        }
        return toDto(projectRepo.save(project));
    }

    @Transactional
    public ProjectDto updateProgress(Long id, Integer progress, String notes, User updatedBy) {
        Project project = findById(id);
        project.setProgressPercentage(Math.min(100, Math.max(0, progress)));
        if (progress >= 100) {
            project.setStatus(Project.ProjectStatus.COMPLETED);
            project.setActualEndDate(LocalDate.now());
        } else if (project.getStatus() == Project.ProjectStatus.PLANNING) {
            project.setStatus(Project.ProjectStatus.IN_PROGRESS);
        }
        ProjectProgress pp = ProjectProgress.builder()
                .project(project).updatedBy(updatedBy)
                .progressPercentage(progress).notes(notes).build();
        progressRepo.save(pp);
        return toDto(projectRepo.save(project));
    }

    @Transactional
    public void deleteProject(Long id) {
        projectRepo.delete(findById(id));
    }

    public List<MilestoneDto> getMilestones(Long projectId) {
        return milestoneRepo.findByProjectIdOrderBySequenceOrder(projectId)
                .stream().map(this::toMilestoneDto).collect(Collectors.toList());
    }

    @Transactional
    public MilestoneDto createMilestone(Long projectId, MilestoneDto dto) {
        Project project = findById(projectId);
        ProjectMilestone milestone = ProjectMilestone.builder()
                .project(project).name(dto.getName()).description(dto.getDescription())
                .plannedDate(dto.getPlannedDate()).sequenceOrder(dto.getSequenceOrder() != null ? dto.getSequenceOrder() : 0)
                .status(dto.getStatus() != null ? dto.getStatus() : ProjectMilestone.MilestoneStatus.PENDING)
                .completionPercentage(dto.getCompletionPercentage() != null ? dto.getCompletionPercentage() : 0)
                .build();
        return toMilestoneDto(milestoneRepo.save(milestone));
    }

    @Transactional
    public MilestoneDto updateMilestone(Long milestoneId, MilestoneDto dto) {
        ProjectMilestone milestone = milestoneRepo.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", milestoneId));
        milestone.setName(dto.getName());
        milestone.setDescription(dto.getDescription());
        milestone.setPlannedDate(dto.getPlannedDate());
        milestone.setStatus(dto.getStatus());
        milestone.setCompletionPercentage(dto.getCompletionPercentage());
        if (dto.getStatus() == ProjectMilestone.MilestoneStatus.COMPLETED && milestone.getCompletedDate() == null) {
            milestone.setCompletedDate(LocalDate.now());
        }
        return toMilestoneDto(milestoneRepo.save(milestone));
    }

    private Project findById(Long id) {
        return projectRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project", id));
    }

    public ProjectDto toDto(Project p) {
        BigDecimal expenses = expenseRepo.sumByProjectId(p.getId());
        long activeWorkers = assignmentRepo.countActiveByProjectId(p.getId());
        return ProjectDto.builder()
                .id(p.getId()).name(p.getName()).description(p.getDescription())
                .location(p.getLocation()).clientName(p.getClientName())
                .projectManager(p.getProjectManager() != null ? UserDto.from(p.getProjectManager()) : null)
                .startDate(p.getStartDate()).plannedEndDate(p.getPlannedEndDate())
                .actualEndDate(p.getActualEndDate()).totalBudget(p.getTotalBudget())
                .status(p.getStatus()).progressPercentage(p.getProgressPercentage())
                .milestones(p.getMilestones().stream().map(this::toMilestoneDto).collect(Collectors.toList()))
                .totalExpenses(expenses).activeWorkers(activeWorkers)
                .createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt())
                .build();
    }

    private MilestoneDto toMilestoneDto(ProjectMilestone m) {
        MilestoneDto dto = new MilestoneDto();
        dto.setId(m.getId()); dto.setProjectId(m.getProject().getId());
        dto.setName(m.getName()); dto.setDescription(m.getDescription());
        dto.setPlannedDate(m.getPlannedDate()); dto.setCompletedDate(m.getCompletedDate());
        dto.setStatus(m.getStatus()); dto.setCompletionPercentage(m.getCompletionPercentage());
        dto.setSequenceOrder(m.getSequenceOrder()); dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }
}
