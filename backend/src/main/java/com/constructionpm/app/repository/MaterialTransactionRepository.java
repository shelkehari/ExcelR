package com.constructionpm.app.repository;

import com.constructionpm.app.entity.MaterialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface MaterialTransactionRepository extends JpaRepository<MaterialTransaction, Long> {
    List<MaterialTransaction> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<MaterialTransaction> findByMaterialIdOrderByCreatedAtDesc(Long materialId);

    @Query("SELECT COALESCE(SUM(mt.quantity * mt.unitCost), 0) FROM MaterialTransaction mt WHERE mt.project.id = :projectId AND mt.type = 'CONSUMPTION'")
    BigDecimal sumConsumptionCostByProject(Long projectId);

    @Query("SELECT COALESCE(SUM(mt.quantity), 0) FROM MaterialTransaction mt WHERE mt.material.id = :materialId AND mt.type = 'CONSUMPTION'")
    BigDecimal sumConsumptionByMaterial(Long materialId);
}
