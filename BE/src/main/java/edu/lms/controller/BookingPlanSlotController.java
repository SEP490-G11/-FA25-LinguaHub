package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.response.UserResponse;
import edu.lms.entity.BookingPlanSlot;
import edu.lms.service.BookingPlanSlotService;
import edu.lms.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/booking-slots")
@RequiredArgsConstructor
@Slf4j

public class BookingPlanSlotController {

    private final BookingPlanSlotService bookingPlanSlotService;
    private final UserService userService; // ⬅️ Thêm dòng này

    @GetMapping("/my-slots")
    public ApiRespond<List<BookingPlanSlot>> getMySlots() {

        // 1) Lấy user hiện tại giống myInfo()
        UserResponse user = userService.getMyInfo();
        Long userId = user.getUserID();
        String role = user.getRole(); // LEARNER / TUTOR

        // 2) Truy vấn slot
        List<BookingPlanSlot> result = ("LEARNER".equalsIgnoreCase(role))
                ? bookingPlanSlotService.getSlotsForUser(userId)
                : bookingPlanSlotService.getSlotsForTutor(userId);

        return ApiRespond.<List<BookingPlanSlot>>builder()
                .code(1000)
                .message("OK")
                .result(result)
                .build();
    }
}

