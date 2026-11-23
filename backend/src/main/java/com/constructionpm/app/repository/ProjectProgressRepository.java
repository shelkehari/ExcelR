package com.constructionpm.app.repository;

import com.constructionpm.app.entity.ProjectProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectProgressRepository extends JpaRepository<ProjectProgress, Long> {
    List<ProjectProgress> findByProjectIdOrderByRecordedAtDesc(Long projectId);
    List<ProjectProgress> findTop10ByProjectIdOrderByRecordedAtDesc(Long projectId);
}
