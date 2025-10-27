package edu.lms.service;

import edu.lms.dto.request.TutorServiceRequest;
import edu.lms.dto.response.TutorServiceResponse;
import edu.lms.entity.Service;
import edu.lms.entity.Tutor;
import edu.lms.enums.TutorStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.ServiceRepository;
import edu.lms.repository.TutorRepository;
import edu.lms.repository.UserServiceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// 🟢 Dùng annotation đầy đủ của Spring, tránh xung đột với entity Service
@org.springframework.stereotype.Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class TutorServiceManager {

    ServiceRepository serviceRepository;
    TutorRepository tutorRepository;
    UserServiceRepository userServiceRepository;

    public TutorServiceResponse createService(TutorServiceRequest request) {
        Tutor tutor = tutorRepository.findById(request.getTutorID())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        if (tutor.getStatus() != TutorStatus.APPROVED)
            throw new AppException(ErrorCode.UNAUTHORIZED);

        Service service = Service.builder()
                .tutor(tutor)
                .title(request.getTitle())
                .duration(request.getDuration())
                .description(request.getDescription())
                .price(request.getPrice())
                .build();

        serviceRepository.save(service);
        return toResponse(service);
    }

    // ✅ GET BY TUTOR
    public List<TutorServiceResponse> getServicesByTutor(Long tutorID) {
        Tutor tutor = tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));
        return serviceRepository.findByTutor(tutor).stream()
                .map(this::toResponse)
                .toList();
    }

    // ✅ GET ALL
    public List<TutorServiceResponse> getAllServices() {
        return serviceRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    // ✅ GET BY ID
    public TutorServiceResponse getServiceById(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));
        return toResponse(service);
    }

    // ✅ UPDATE
    public TutorServiceResponse updateService(Long id, TutorServiceRequest request) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));

        service.setTitle(request.getTitle());
        service.setDuration(request.getDuration());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());

        serviceRepository.save(service);
        return toResponse(service);
    }

    // ✅ DELETE
    public void deleteService(Long id) {
        if (userServiceRepository.existsByService_ServiceID(id)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        serviceRepository.deleteById(id);
    }

    private TutorServiceResponse toResponse(Service s) {
        return TutorServiceResponse.builder()
                .serviceID(s.getServiceID())
                .title(s.getTitle())
                .duration(s.getDuration())
                .description(s.getDescription())
                .price(s.getPrice())
                .tutorName(s.getTutor().getUser().getFullName())
                .build();
    }
}
