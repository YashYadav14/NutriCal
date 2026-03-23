package com.yash.nutrition.repository;

import com.yash.nutrition.entity.CaloriesRecord;
import com.yash.nutrition.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CaloriesRepository extends JpaRepository<CaloriesRecord, Long> {
    List<CaloriesRecord> findByUserOrderByCreatedAtAsc(User user);
}
