package com.emr.emr_system.modules.icd_codes.service.impl;

import com.emr.emr_system.modules.icd_codes.dto.IcdCodeCreateRequest;
import com.emr.emr_system.modules.icd_codes.dto.IcdCodeResponse;
import com.emr.emr_system.modules.icd_codes.entity.IcdCode;
import com.emr.emr_system.modules.icd_codes.repository.IcdCodeRepository;
import com.emr.emr_system.modules.icd_codes.service.IcdCodeService;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IcdCodeServiceImpl implements IcdCodeService {
    private final IcdCodeRepository icdCodeRepository;

    @Override
    public Page<IcdCodeResponse> searchIcdCodes(String keyword, String category, Pageable pageable) {
        String normalizedKeyword = (keyword == null || keyword.isBlank())
            ? null
            : "%" + keyword.trim().toLowerCase() + "%";
        String normalizedCategory = (category == null || category.isBlank())
            ? null
            : category.trim();

        return icdCodeRepository.searchIcdCodes(normalizedKeyword, normalizedCategory, pageable)
            .map(this::toResponse);
    }

    @Override
    public IcdCodeResponse getIcdCodeById(String id) {
        IcdCode icdCode = icdCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("IcdCode", "id", id));
        return toResponse(icdCode);
    }

    @Override
    public IcdCodeResponse createIcdCode(IcdCodeCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.getId() == null || request.getId().isBlank() || request.getName() == null
                || request.getName().isBlank()) {
            throw new IllegalArgumentException("id and name are required");
        }

        String id = request.getId().trim();
        if (icdCodeRepository.existsById(id)) {
            throw new DuplicateResourceException("IcdCode", "id", id);
        }

        IcdCode icdCode = IcdCode.builder()
                .id(id)
                .name(request.getName().trim())
                .category(request.getCategory())
                .description(request.getDescription())
                .build();

        IcdCode saved = icdCodeRepository.save(icdCode);
        return toResponse(saved);
    }

    @Override
    public IcdCodeResponse updateIcdCode(String id, IcdCodeCreateRequest request) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("id is required");
        }
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("name is required");
        }

        IcdCode icdCode = icdCodeRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("IcdCode", "id", id));

        icdCode.setName(request.getName().trim());
        icdCode.setCategory(request.getCategory());
        icdCode.setDescription(request.getDescription());

        IcdCode saved = icdCodeRepository.save(icdCode);
        return toResponse(saved);
    }

    @Override
    public void deleteIcdCode(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("id is required");
        }

        IcdCode icdCode = icdCodeRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("IcdCode", "id", id));
        icdCodeRepository.delete(icdCode);
    }

    private IcdCodeResponse toResponse(IcdCode icdCode) {
        return IcdCodeResponse.builder()
                .id(icdCode.getId())
                .name(icdCode.getName())
                .category(icdCode.getCategory())
                .description(icdCode.getDescription())
                .build();
    }
}
