package com.emr.emr_system.modules.icd_codes.service;

import com.emr.emr_system.modules.icd_codes.dto.IcdCodeCreateRequest;
import com.emr.emr_system.modules.icd_codes.dto.IcdCodeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IcdCodeService {
    Page<IcdCodeResponse> searchIcdCodes(String keyword, String category, Pageable pageable);

    IcdCodeResponse getIcdCodeById(String id);

    IcdCodeResponse createIcdCode(IcdCodeCreateRequest request);
}
