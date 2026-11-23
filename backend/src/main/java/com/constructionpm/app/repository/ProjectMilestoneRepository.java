package com.constructionpm.app.repository;

import com.constructionpm.app.entity.ProjectMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectMilestoneRepository extends JpaRepository<ProjectMilestone, Long> {
    List<ProjectMilestone> findByProjectIdOrderBySequenceOrder(Long projectId);
    long countByProjectIdAndStatus(Long projectId, ProjectMilestone.MilestoneStatus status);
}
