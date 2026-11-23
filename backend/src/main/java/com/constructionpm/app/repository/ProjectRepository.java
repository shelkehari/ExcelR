package com.constructionpm.app.repository;

import com.constructionpm.app.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStatus(Project.ProjectStatus status);
    List<Project> findByProjectManagerId(Long managerId);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.status = :status")
    long countByStatus(Project.ProjectStatus status);

    @Query("SELECT p FROM Project p WHERE p.status IN ('IN_PROGRESS', 'DELAYED') ORDER BY p.plannedEndDate ASC")
    List<Project> findActiveProjects();
}
