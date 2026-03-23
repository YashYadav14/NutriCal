package com.yash.nutrition.repository;

import com.yash.nutrition.entity.BMIRecord;
import com.yash.nutrition.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BMIRepository extends JpaRepository<BMIRecord, Long> {
    List<BMIRecord> findByUserOrderByCreatedAtAsc(User user);
}
