package edu.lms.service;

import edu.lms.dto.request.TutorPackageRequest;
import edu.lms.dto.response.OperationStatusResponse;
import edu.lms.dto.response.TutorPackageCreateResponse;
import edu.lms.dto.response.TutorPackageListResponse;
import edu.lms.dto.response.TutorPackageResponse;
import edu.lms.entity.Tutor;
import edu.lms.entity.TutorPackage;
import edu.lms.enums.TutorStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.mapper.TutorPackageMapper;
import edu.lms.repository.TutorPackageRepository;
import edu.lms.repository.TutorRepository;
import edu.lms.repository.UserPackageRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TutorPackageService {

    TutorRepository tutorRepository;
    TutorPackageRepository tutorPackageRepository;
    UserPackageRepository userPackageRepository;
    TutorPackageMapper tutorPackageMapper;

    @Transactional
    public TutorPackageCreateResponse createTutorPackage(Long currentUserId, TutorPackageRequest request) {
        Tutor tutor = getActiveTutorByUserId(currentUserId);

        request.setName(normalizeName(request.getName()));

        validateDuplicateName(tutor.getTutorID(), request.getName(), null);

        TutorPackage entity = tutorPackageMapper.toEntity(request);
        entity.setTutor(tutor);

        TutorPackage saved = tutorPackageRepository.save(entity);

        return TutorPackageCreateResponse.builder()
                .success(true)
                .packageId(saved.getPackageID())
                .message("Tutor package created successfully")
                .build();
    }

    @Transactional
    public OperationStatusResponse updateTutorPackage(Long currentUserId, Long packageId, TutorPackageRequest request) {
        Tutor tutor = getActiveTutorByUserId(currentUserId);

        TutorPackage tutorPackage = tutorPackageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_PACKAGE_NOT_FOUND));

        ensurePackageOwner(tutor, tutorPackage);
        ensurePackageNotPurchased(packageId);

        request.setName(normalizeName(request.getName()));

        validateDuplicateName(tutor.getTutorID(), request.getName(), packageId);

        tutorPackageMapper.updateEntityFromRequest(request, tutorPackage);
        tutorPackageRepository.save(tutorPackage);

        return OperationStatusResponse.success("Tutor package updated successfully.");
    }

    @Transactional
    public OperationStatusResponse deleteTutorPackage(Long currentUserId, Long packageId) {
        Tutor tutor = getActiveTutorByUserId(currentUserId);

        TutorPackage tutorPackage = tutorPackageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_PACKAGE_NOT_FOUND));

        ensurePackageOwner(tutor, tutorPackage);
        ensurePackageNotPurchased(packageId);

        tutorPackageRepository.delete(tutorPackage);

        return OperationStatusResponse.success("Tutor package deleted successfully.");
    }

    @Transactional(readOnly = true)
    public TutorPackageListResponse getPackagesByTutor(Long tutorId) {
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        List<TutorPackageResponse> packages = tutorPackageRepository.findByTutor_TutorID(tutor.getTutorID())
                .stream()
                .map(tutorPackageMapper::toResponse)
                .toList();

        return TutorPackageListResponse.builder()
                .packages(packages)
                .build();
    }

    @Transactional(readOnly = true)
    public TutorPackageResponse getPackageDetail(Long packageId) {
        TutorPackage tutorPackage = tutorPackageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_PACKAGE_NOT_FOUND));
        return tutorPackageMapper.toResponse(tutorPackage);
    }

    private Tutor getActiveTutorByUserId(Long currentUserId) {
        Tutor tutor = tutorRepository.findByUser_UserID(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        if (tutor.getStatus() != TutorStatus.APPROVED) {
            if (tutor.getStatus() == TutorStatus.SUSPENDED) {
                throw new AppException(ErrorCode.TUTOR_ACCOUNT_LOCKED);
            }
            throw new AppException(ErrorCode.TUTOR_NOT_APPROVED);
        }
        return tutor;
    }

    private void ensurePackageOwner(Tutor tutor, TutorPackage tutorPackage) {
        if (!tutorPackage.getTutor().getTutorID().equals(tutor.getTutorID())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private void ensurePackageNotPurchased(Long packageId) {
        if (userPackageRepository.existsByTutorPackage_PackageID(packageId)) {
            throw new AppException(ErrorCode.TUTOR_PACKAGE_ALREADY_PURCHASED);
        }
    }

    private void validateDuplicateName(Long tutorId, String name, Long excludePackageId) {
        tutorPackageRepository.findByTutor_TutorIDAndNameIgnoreCase(tutorId, name)
                .ifPresent(existing -> {
                    if (excludePackageId == null || !existing.getPackageID().equals(excludePackageId)) {
                        throw new AppException(ErrorCode.TUTOR_PACKAGE_DUPLICATE_NAME);
                    }
                });
    }

    private String normalizeName(String name) {
        return name == null ? null : name.trim();
    }
}


