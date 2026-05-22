package com.emr.emr_system.modules.icd_codes.repository;

import com.emr.emr_system.modules.icd_codes.entity.IcdCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IcdCodeRepository extends JpaRepository<IcdCode, String> {
	@Query("""
			SELECT c
			FROM IcdCode c
			WHERE (:category IS NULL OR c.category = :category)
				AND (:keyword IS NULL OR LOWER(c.id) LIKE :keyword OR LOWER(c.name) LIKE :keyword)
			""")
	Page<IcdCode> searchIcdCodes(@Param("keyword") String keyword,
								 @Param("category") String category,
								 Pageable pageable);
}
