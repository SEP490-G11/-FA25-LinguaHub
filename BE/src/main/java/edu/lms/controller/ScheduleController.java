//package edu.lms.controller;
//
//import edu.lms.dto.request.ApiRespond;
//import edu.lms.dto.response.ScheduleResponse;
//import edu.lms.service.ScheduleService;
//import io.swagger.v3.oas.annotations.Operation;
//import io.swagger.v3.oas.annotations.tags.Tag;
//import lombok.AccessLevel;
//import lombok.RequiredArgsConstructor;
//import lombok.experimental.FieldDefaults;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/tutors")
//@RequiredArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
//@Tag(name = "Schedule", description = "Schedule Management API")
//public class ScheduleController {
//
//    ScheduleService scheduleService;
//
//    @Operation(summary = "View tutor's weekly schedule")
//    @GetMapping("/{tutorID}/schedules")
//    public ApiRespond<List<ScheduleResponse>> getSchedules(
//            @PathVariable Long tutorID,
//            @RequestParam(required = false, defaultValue = "0") Integer week) {
//
//        List<ScheduleResponse> schedules = scheduleService.getSchedulesByTutor(tutorID, week);
//
//        return ApiRespond.<List<ScheduleResponse>>builder()
//                .result(schedules)
//                .message("Schedules retrieved successfully")
//                .build();
//    }
//}
