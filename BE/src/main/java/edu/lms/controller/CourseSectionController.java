package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.CourseSectionRequest;
import edu.lms.dto.response.CourseSectionResponse;
import edu.lms.service.CourseSectionService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lombok.AccessLevel.PRIVATE;

@RestController
@RequestMapping("/tutor/courses/sections")
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class CourseSectionController {

    CourseSectionService courseSectionService;

    // CREATE
    @PostMapping
    public ApiRespond<CourseSectionResponse> createSection(@RequestBody CourseSectionRequest request) {
        return ApiRespond.<CourseSectionResponse>builder()
                .result(courseSectionService.createSection(request))
                .message("Section created successfully")
                .build();
    }

    // GET ALL BY COURSE
    @GetMapping("/{courseID}")
    public ApiRespond<List<CourseSectionResponse>> getSectionsByCourse(@PathVariable Long courseID) {
        return ApiRespond.<List<CourseSectionResponse>>builder()
                .result(courseSectionService.getSectionsByCourse(courseID))
                .build();
    }

    // GET ONE
    @GetMapping("/detail/{sectionID}")
    public ApiRespond<CourseSectionResponse> getSectionById(@PathVariable Long sectionID) {
        return ApiRespond.<CourseSectionResponse>builder()
                .result(courseSectionService.getSectionById(sectionID))
                .build();
    }

    // UPDATE
    @PutMapping("/{sectionID}")
    public ApiRespond<CourseSectionResponse> updateSection(
            @PathVariable Long sectionID,
            @RequestBody CourseSectionRequest request
    ) {
        return ApiRespond.<CourseSectionResponse>builder()
                .result(courseSectionService.updateSection(sectionID, request))
                .message("Section updated successfully")
                .build();
    }

    // DELETE
    @DeleteMapping("/{sectionID}")
    public ApiRespond<Void> deleteSection(@PathVariable Long sectionID) {
        courseSectionService.deleteSection(sectionID);
        return ApiRespond.<Void>builder()
                .message("Section deleted successfully")
                .build();
    }
}
