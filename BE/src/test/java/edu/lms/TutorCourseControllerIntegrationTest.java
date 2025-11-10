//package edu.lms;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import edu.lms.dto.request.TutorCourseRequest;
//import org.junit.jupiter.api.*;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.http.MediaType;
//import org.springframework.test.context.ActiveProfiles;
//import org.springframework.test.web.servlet.MockMvc;
//
//import java.math.BigDecimal;
//import java.util.Map;
//
//import static org.hamcrest.Matchers.*;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
///**
// * Integration Test for TutorCourseController
// * Scenario: Tutor login -> create -> read -> update -> submit -> delete
// */
//@SpringBootTest
//@ActiveProfiles("test")
//@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
//@AutoConfigureMockMvc
//@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
//class TutorCourseControllerIntegrationTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    private static String tutorAccessToken;
//    private static Long createdCourseId;
//
//    @BeforeAll
//    static void setupTokens() {
//        // Bạn cần đảm bảo trong DB có tài khoản tutor đã APPROVED
//        // Ví dụ: tutor01@gmail.com, password: 12345678
//        tutorAccessToken = "YOUR_TUTOR_ACCESS_TOKEN_HERE"; // Có thể tự động set từ /auth/token nếu cần
//    }
//
//    private TutorCourseRequest buildCourseRequest() {
//        return TutorCourseRequest.builder()
//                .title("Integration Test Course")
//                .description("Course created by integration test")
//                .duration(60)
//                .price(new BigDecimal("99.99"))
//                .language("English")
//                .thumbnailURL("https://example.com/image.png")
//                .categoryID(1L)
//                .build();
//    }
//
//    @Test
//    @Order(1)
//    @DisplayName("POST /tutor/courses → create new course")
//    void createCourse_shouldReturnCreatedCourse() throws Exception {
//        TutorCourseRequest request = buildCourseRequest();
//
//        var result = mockMvc.perform(post("/tutor/courses")
//                        .header("Authorization", "Bearer " + tutorAccessToken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(request)))
//                .andExpect(status().isCreated())
//                .andExpect(jsonPath("$.result.title", is("Integration Test Course")))
//                .andExpect(jsonPath("$.result.status", is("Draft")))
//                .andReturn();
//
//        Map<String, Object> response = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
//        Map<String, Object> courseResult = (Map<String, Object>) response.get("result");
//        createdCourseId = ((Number) courseResult.get("id")).longValue();
//    }
//
//    @Test
//    @Order(2)
//    @DisplayName("GET /tutor/courses/me → get my courses")
//    void getMyCourses_shouldReturnList() throws Exception {
//        mockMvc.perform(get("/tutor/courses/me")
//                        .header("Authorization", "Bearer " + tutorAccessToken))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.result", not(empty())));
//    }
//
//    @Test
//    @Order(3)
//    @DisplayName("PUT /tutor/courses/{id} → update course info")
//    void updateCourse_shouldSucceed() throws Exception {
//        TutorCourseRequest request = buildCourseRequest();
//        request.setTitle("Updated Integration Test Course");
//
//        mockMvc.perform(put("/tutor/courses/" + createdCourseId)
//                        .header("Authorization", "Bearer " + tutorAccessToken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(request)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.result.title", is("Updated Integration Test Course")));
//    }
//
//    @Test
//    @Order(4)
//    @DisplayName("GET /tutor/courses/{id} → get course detail")
//    void getMyCourseDetail_shouldReturnDetail() throws Exception {
//        mockMvc.perform(get("/tutor/courses/" + createdCourseId)
//                        .header("Authorization", "Bearer " + tutorAccessToken))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.result.id", is(createdCourseId.intValue())))
//                .andExpect(jsonPath("$.result.status", is("Draft")));
//    }
//
//    @Test
//    @Order(5)
//    @DisplayName("PUT /tutor/courses/{id}/submit → submit for review")
//    void submitCourse_shouldSetPendingStatus() throws Exception {
//        mockMvc.perform(put("/tutor/courses/" + createdCourseId + "/submit")
//                        .header("Authorization", "Bearer " + tutorAccessToken))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.result.status", is("Pending")))
//                .andExpect(jsonPath("$.message", containsString("submitted")));
//    }
//
//    @Test
//    @Order(6)
//    @DisplayName("DELETE /tutor/courses/{id} → delete course (Draft or Rejected only)")
//    void deleteCourse_shouldWorkIfDraftOrRejected() throws Exception {
//        // Nếu course đang Pending → sẽ lỗi. Có thể reset status về Draft trong DB test trước khi chạy.
//        mockMvc.perform(delete("/tutor/courses/" + createdCourseId)
//                        .header("Authorization", "Bearer " + tutorAccessToken))
//                .andExpect(status().isNoContent());
//    }
//}
