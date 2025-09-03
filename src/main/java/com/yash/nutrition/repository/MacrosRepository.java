package com.yash.nutrition.repository;

import com.yash.nutrition.entity.MacrosRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MacrosRepository extends JpaRepository<MacrosRecord, Long> {
}
