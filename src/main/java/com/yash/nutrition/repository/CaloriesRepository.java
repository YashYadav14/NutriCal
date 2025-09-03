package com.yash.nutrition.repository;

import com.yash.nutrition.entity.CaloriesRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaloriesRepository extends JpaRepository<CaloriesRecord, Long> {
}
