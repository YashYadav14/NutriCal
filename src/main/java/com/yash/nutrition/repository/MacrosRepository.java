package com.yash.nutrition.repository;

import com.yash.nutrition.entity.MacrosRecord;
import com.yash.nutrition.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MacrosRepository extends JpaRepository<MacrosRecord, Long> {
    List<MacrosRecord> findByUserOrderByCreatedAtAsc(User user);
}
