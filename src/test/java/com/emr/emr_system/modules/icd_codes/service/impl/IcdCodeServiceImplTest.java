package com.emr.emr_system.modules.icd_codes.service.impl;

import com.emr.emr_system.modules.icd_codes.dto.IcdCodeCreateRequest;
import com.emr.emr_system.modules.icd_codes.dto.IcdCodeResponse;
import com.emr.emr_system.modules.icd_codes.entity.IcdCode;
import com.emr.emr_system.modules.icd_codes.repository.IcdCodeRepository;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class IcdCodeServiceImplTest {

    @Mock
    private IcdCodeRepository icdCodeRepository;

    @InjectMocks
    private IcdCodeServiceImpl icdCodeService;

    private IcdCode icdCode;

    @BeforeEach
    void setUp() {
        icdCode = IcdCode.builder()
                .id("J01.90")
                .name("Acute sinusitis, unspecified")
                .category("J00-J99")
                .description("Respiratory diseases")
                .build();
    }

    @Test
    void searchIcdCodes_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<IcdCode> page = new PageImpl<>(List.of(icdCode));

        when(icdCodeRepository.searchIcdCodes(any(), any(), eq(pageable))).thenReturn(page);

        Page<IcdCodeResponse> result = icdCodeService.searchIcdCodes("sinus", "J00", pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("J01.90", result.getContent().get(0).getId());
    }

    @Test
    void getIcdCodeById_Success() {
        when(icdCodeRepository.findById("J01.90")).thenReturn(Optional.of(icdCode));

        IcdCodeResponse response = icdCodeService.getIcdCodeById("J01.90");

        assertNotNull(response);
        assertEquals("J01.90", response.getId());
    }

    @Test
    void getIcdCodeById_NotFound_ThrowsException() {
        when(icdCodeRepository.findById("J01.90")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> icdCodeService.getIcdCodeById("J01.90"));
    }

    @Test
    void createIcdCode_Success() {
        IcdCodeCreateRequest request = new IcdCodeCreateRequest();
        request.setId("J01.90");
        request.setName("Acute sinusitis");
        request.setCategory("J00");

        when(icdCodeRepository.existsById("J01.90")).thenReturn(false);
        when(icdCodeRepository.save(any(IcdCode.class))).thenReturn(icdCode);

        IcdCodeResponse response = icdCodeService.createIcdCode(request);

        assertNotNull(response);
        assertEquals("J01.90", response.getId());
        verify(icdCodeRepository, times(1)).save(any(IcdCode.class));
    }

    @Test
    void createIcdCode_Duplicate_ThrowsException() {
        IcdCodeCreateRequest request = new IcdCodeCreateRequest();
        request.setId("J01.90");
        request.setName("Acute sinusitis");

        when(icdCodeRepository.existsById("J01.90")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> icdCodeService.createIcdCode(request));
    }

    @Test
    void createIcdCode_NullRequest_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> icdCodeService.createIcdCode(null));
    }

    @Test
    void createIcdCode_MissingIdOrName_ThrowsException() {
        IcdCodeCreateRequest request1 = new IcdCodeCreateRequest();
        request1.setName("Acute sinusitis");
        // ID is missing

        IcdCodeCreateRequest request2 = new IcdCodeCreateRequest();
        request2.setId("J01.90");
        // Name is missing

        assertThrows(IllegalArgumentException.class, () -> icdCodeService.createIcdCode(request1));
        assertThrows(IllegalArgumentException.class, () -> icdCodeService.createIcdCode(request2));
    }
}
