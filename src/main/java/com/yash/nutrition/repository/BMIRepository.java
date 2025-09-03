package com.yash.nutrition.repository;

import com.yash.nutrition.entity.BMIRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BMIRepository extends JpaRepository<BMIRecord, Long> {
}
