package com.emr.emr_system.modules.icd_codes.controller;

import com.emr.emr_system.modules.icd_codes.dto.IcdCodeCreateRequest;
import com.emr.emr_system.modules.icd_codes.dto.IcdCodeResponse;
import com.emr.emr_system.modules.icd_codes.service.IcdCodeService;
import com.emr.emr_system.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/icd-codes")
@RequiredArgsConstructor
public class IcdCodesController {
    private final IcdCodeService icdCodeService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<IcdCodeResponse>>> searchIcdCodes(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category) {
        Pageable pageable = PageRequest.of(page, size);
        Page<IcdCodeResponse> result = icdCodeService.searchIcdCodes(keyword, category, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "ICD codes retrieved"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IcdCodeResponse>> getIcdCodeById(@PathVariable String id) {
        IcdCodeResponse result = icdCodeService.getIcdCodeById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "ICD code retrieved"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<IcdCodeResponse>> createIcdCode(@RequestBody IcdCodeCreateRequest request) {
        IcdCodeResponse result = icdCodeService.createIcdCode(request);
        return ResponseEntity.ok(ApiResponse.success(result, "ICD code created"));
    }
}
