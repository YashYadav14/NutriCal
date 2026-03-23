package com.yash.nutrition.repository;

import com.yash.nutrition.entity.SavedDietPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedDietPlanRepository extends JpaRepository<SavedDietPlan, Long> {
    List<SavedDietPlan> findByUserIdOrderByCreatedAtDesc(String userId);
}
