package com.constructionpm.app.repository;

import com.constructionpm.app.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByActiveTrue();
    List<Material> findByCategory(String category);

    @Query("SELECT m FROM Material m WHERE m.availableQuantity <= m.reorderLevel AND m.active = true")
    List<Material> findLowStockMaterials();
}
