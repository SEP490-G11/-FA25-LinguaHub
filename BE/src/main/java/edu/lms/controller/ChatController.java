//package edu.lms.controller;
//
//import edu.lms.dto.request.ApiRespond;
//import edu.lms.dto.request.SendMessageRequest;
//import edu.lms.dto.response.ChatMessageResponse;
//import edu.lms.dto.response.ChatRoomResponse;
//import edu.lms.security.UserPrincipal;
//import edu.lms.service.ChatService;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@Slf4j
//@RestController
//@RequestMapping("/chat")
//@RequiredArgsConstructor
//public class ChatController {
//
//    private final ChatService chatService;
//
//    /**
//     * Get or create Advice chat room
//     * Flow A: Learner views Tutor profile → click "Chat to Ask"
//     */
//    @PostMapping("/advice/{tutorID}")
//    public ResponseEntity<ApiRespond<ChatRoomResponse>> getOrCreateAdviceRoom(
//            @PathVariable Long tutorID
//    ) {
//        Long learnerID = getCurrentUserId();
//        ChatRoomResponse room = chatService.getOrCreateAdviceRoom(learnerID, tutorID);
//        return ResponseEntity.ok(ApiRespond.<ChatRoomResponse>builder()
//                .result(room)
//                .build());
//    }
//
//    /**
//     * Send message to chat room
//     * Supports both Advice and Training chat
//     */
//    @PostMapping("/message")
//    public ResponseEntity<ApiRespond<ChatMessageResponse>> sendMessage(
//            @RequestBody @Valid SendMessageRequest request
//    ) {
//        Long senderID = getCurrentUserId();
//        ChatMessageResponse message = chatService.sendMessage(senderID, request);
//        return ResponseEntity.ok(ApiRespond.<ChatMessageResponse>builder()
//                .result(message)
//                .build());
//    }
//
//    /**
//     * Get chat room with messages
//     */
//    @GetMapping("/room/{chatRoomId}")
//    public ResponseEntity<ApiRespond<ChatRoomResponse>> getChatRoom(
//            @PathVariable Long chatRoomId
//    ) {
//        Long userID = getCurrentUserId();
//        ChatRoomResponse room = chatService.getChatRoom(chatRoomId, userID);
//        return ResponseEntity.ok(ApiRespond.<ChatRoomResponse>builder()
//                .result(room)
//                .build());
//    }
//
//    /**
//     * Get all chat rooms for current user
//     */
//    @GetMapping("/rooms")
//    public ResponseEntity<ApiRespond<List<ChatRoomResponse>>> getUserChatRooms() {
//        Long userID = getCurrentUserId();
//        List<ChatRoomResponse> rooms = chatService.getUserChatRooms(userID);
//        return ResponseEntity.ok(ApiRespond.<List<ChatRoomResponse>>builder()
//                .result(rooms)
//                .build());
//    }
//
//    /**
//     * Send Google Meet link to chat room (Tutor only)
//     * This allows tutor to share meeting link from Booking.MeetingLink
//     */
//    @PostMapping("/room/{chatRoomId}/meeting-link")
//    public ResponseEntity<ApiRespond<ChatMessageResponse>> sendMeetingLink(
//            @PathVariable Long chatRoomId,
//            @RequestBody String meetingLink
//    ) {
//        Long tutorID = getCurrentUserId();
//        ChatMessageResponse message = chatService.sendMeetingLink(tutorID, chatRoomId, meetingLink);
//        return ResponseEntity.ok(ApiRespond.<ChatMessageResponse>builder()
//                .result(message)
//                .build());
//    }
//
//    /**
//     * Helper method to get current user ID from JWT token
//     */
//    private Long getCurrentUserId() {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
//            return ((UserPrincipal) authentication.getPrincipal()).getUserId();
//        }
//        throw new RuntimeException("User not authenticated");
//    }
//}
//
