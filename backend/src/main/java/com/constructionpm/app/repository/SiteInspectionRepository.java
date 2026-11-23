package com.constructionpm.app.repository;

import com.constructionpm.app.entity.SiteInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface SiteInspectionRepository extends JpaRepository<SiteInspection, Long> {
    List<SiteInspection> findByProjectIdOrderByScheduledDateDesc(Long projectId);
    List<SiteInspection> findByStatus(SiteInspection.InspectionStatus status);
    List<SiteInspection> findByInspectorId(Long inspectorId);
    long countByProjectIdAndStatus(Long projectId, SiteInspection.InspectionStatus status);

    @Query("SELECT COUNT(s) FROM SiteInspection s WHERE s.status = :status")
    long countByStatus(SiteInspection.InspectionStatus status);
}
