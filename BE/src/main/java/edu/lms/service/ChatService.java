package edu.lms.service;

import edu.lms.dto.request.SendMessageRequest;
import edu.lms.dto.response.ChatMessageResponse;
import edu.lms.dto.response.ChatRoomResponse;
import edu.lms.entity.*;
import edu.lms.enums.BookingStatus;
import edu.lms.enums.ChatRoomType;
import edu.lms.enums.MessageType;
import edu.lms.enums.TutorStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class ChatService {

    ChatRoomRepository chatRoomRepository;
    ChatRoomMessageRepository chatRoomMessageRepository;
    UserRepository userRepository;
    TutorRepository tutorRepository;
    BookingRepository bookingRepository;

    /**
     * Get or create Advice chat room between Learner and Tutor
     * Business Rule: Each Learner-Tutor pair has only 1 Advice room
     */
    public ChatRoomResponse getOrCreateAdviceRoom(Long learnerID, Long tutorID) {
        log.info("Getting or creating Advice room for Learner {} and Tutor {}", learnerID, tutorID);

        User learner = userRepository.findById(learnerID)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        Tutor tutor = tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        // Check if Advice room already exists
        ChatRoom adviceRoom = chatRoomRepository
                .findByUserAndTutorAndChatRoomType(learner, tutor, ChatRoomType.Advice)
                .orElseGet(() -> {
                    log.info("Creating new Advice room for Learner {} and Tutor {}", learnerID, tutorID);
                    return createAdviceRoom(learner, tutor);
                });

        return mapToChatRoomResponse(adviceRoom);
    }

    /**
     * Get or create Training chat room between Learner and Tutor
     * Business Rule: Each Learner-Tutor pair has only 1 Training room
     * This is called automatically when Booking is created
     */
    public ChatRoomResponse getOrCreateTrainingRoom(Long learnerID, Long tutorID) {
        log.info("Getting or creating Training room for Learner {} and Tutor {}", learnerID, tutorID);

        User learner = userRepository.findById(learnerID)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        Tutor tutor = tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        // Check if Training room already exists
        ChatRoom trainingRoom = chatRoomRepository
                .findByUserAndTutorAndChatRoomType(learner, tutor, ChatRoomType.Training)
                .orElseGet(() -> {
                    log.info("Creating new Training room for Learner {} and Tutor {}", learnerID, tutorID);
                    return createTrainingRoom(learner, tutor);
                });

        return mapToChatRoomResponse(trainingRoom);
    }

    /**
     * Create Advice room
     */
    private ChatRoom createAdviceRoom(User learner, Tutor tutor) {
        String title = String.format("Advice Chat - %s & %s",
                learner.getFullName() != null ? learner.getFullName() : learner.getEmail(),
                tutor.getUser().getFullName() != null ? tutor.getUser().getFullName() : tutor.getUser().getEmail());

        ChatRoom room = ChatRoom.builder()
                .user(learner)
                .tutor(tutor)
                .chatRoomType(ChatRoomType.Advice)
                .title(title)
                .description("Advice chat room for pre-booking consultation")
                .build();

        return chatRoomRepository.save(room);
    }

    /**
     * Create Training room
     */
    private ChatRoom createTrainingRoom(User learner, Tutor tutor) {
        String title = String.format("Training Chat - %s & %s",
                learner.getFullName() != null ? learner.getFullName() : learner.getEmail(),
                tutor.getUser().getFullName() != null ? tutor.getUser().getFullName() : tutor.getUser().getEmail());

        ChatRoom room = ChatRoom.builder()
                .user(learner)
                .tutor(tutor)
                .chatRoomType(ChatRoomType.Training)
                .title(title)
                .description("Training chat room for learning sessions")
                .build();

        return chatRoomRepository.save(room);
    }

    /**
     * Send message to chat room
     * Enforces business rules:
     * - Advice room: only Text messages allowed
     * - Training room: Text, Image, File allowed
     * - Tutor suspended: read-only
     * - Booking cancelled: read-only
     */
    public ChatMessageResponse sendMessage(Long senderId, SendMessageRequest request) {
        log.info("User {} sending message to ChatRoom {}", senderId, request.getChatRoomID());

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        ChatRoom chatRoom = chatRoomRepository.findById(request.getChatRoomID())
                .orElseThrow(() -> new AppException(ErrorCode.CHAT_ROOM_NOT_FOUND));

        // Verify sender is either the learner or tutor in this room
        if (!chatRoom.getUser().getUserID().equals(senderId) &&
                !chatRoom.getTutor().getUser().getUserID().equals(senderId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Check if room is read-only (Tutor suspended or Booking cancelled)
        if (isRoomReadOnly(chatRoom)) {
            throw new AppException(ErrorCode.UNAUTHORIZED); // Or create specific error code
        }

        // Validate message type based on room type
        validateMessageType(chatRoom.getChatRoomType(), request.getMessageType());

        // Create and save message
        ChatRoomMessage message = ChatRoomMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .content(request.getContent())
                .messageType(request.getMessageType())
                .createdAt(LocalDateTime.now())
                .build();

        message = chatRoomMessageRepository.save(message);
        log.info("Message saved successfully with ID {}", message.getMessageID());

        return mapToChatMessageResponse(message);
    }

    /**
     * Check if room is read-only based on business rules
     */
    private boolean isRoomReadOnly(ChatRoom chatRoom) {
        Tutor tutor = chatRoom.getTutor();

        // Rule: When Tutor is suspended → both Advice and Training are read-only
        if (tutor.getStatus() == TutorStatus.SUSPENDED) {
            log.info("Room {} is read-only because Tutor {} is suspended",
                    chatRoom.getChatRoomID(), tutor.getTutorID());
            return true;
        }

        // Rule: When Booking is cancelled → Training room is read-only
        if (chatRoom.getChatRoomType() == ChatRoomType.Training) {
            List<Booking> bookings = bookingRepository.findByUserAndTutor(
                    chatRoom.getUser(), tutor);

            // Check if there's any active (Booked) booking
            boolean hasActiveBooking = bookings.stream()
                    .anyMatch(b -> b.getStatus() == BookingStatus.Booked);

            // If no active booking exists (all are cancelled/completed), room is read-only
            if (!hasActiveBooking && !bookings.isEmpty()) {
                log.info("Room {} is read-only because all bookings are cancelled/completed",
                        chatRoom.getChatRoomID());
                return true;
            }
        }

        return false;
    }

    /**
     * Validate message type based on room type
     */
    private void validateMessageType(ChatRoomType roomType, MessageType messageType) {
        if (roomType == ChatRoomType.Advice) {
            // Advice can only send text, not files
            if (messageType != MessageType.Text) {
                throw new AppException(ErrorCode.INVALID_KEY); // Or create specific error code
            }
        }
        // Training allows Text, Image, File - no validation needed
    }

    /**
     * Get chat room with messages
     */
    public ChatRoomResponse getChatRoom(Long chatRoomId, Long userId) {
        log.info("Getting ChatRoom {} for User {}", chatRoomId, userId);

        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new AppException(ErrorCode.CHAT_ROOM_NOT_FOUND));

        // Verify user has access to this room
        if (!chatRoom.getUser().getUserID().equals(userId) &&
                !chatRoom.getTutor().getUser().getUserID().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return mapToChatRoomResponse(chatRoom);
    }

    /**
     * Get all chat rooms for a user (both as learner and tutor)
     */
    public List<ChatRoomResponse> getUserChatRooms(Long userId) {
        log.info("Getting all chat rooms for User {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        List<ChatRoom> rooms = chatRoomRepository.findByUser(user);

        // Also get rooms where user is the tutor
        Tutor tutor = tutorRepository.findByUser(user).orElse(null);
        if (tutor != null) {
            rooms.addAll(chatRoomRepository.findByTutor(tutor));
        }

        return rooms.stream()
                .map(this::mapToChatRoomResponse)
                .collect(Collectors.toList());
    }

    /**
     * Send Google Meet link automatically (from Booking.MeetingLink)
     * This is called when tutor wants to share meeting link
     */
    public ChatMessageResponse sendMeetingLink(Long tutorID, Long chatRoomId, String meetingLink) {
        log.info("Tutor {} sending meeting link to ChatRoom {}", tutorID, chatRoomId);

        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new AppException(ErrorCode.CHAT_ROOM_NOT_FOUND));

        // Verify tutor owns this room
        if (!chatRoom.getTutor().getUser().getUserID().equals(tutorID)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        Tutor tutor = chatRoom.getTutor();
        User tutorUser = tutor.getUser();

        // Create message with meeting link
        ChatRoomMessage message = ChatRoomMessage.builder()
                .chatRoom(chatRoom)
                .sender(tutorUser)
                .content(meetingLink)
                .messageType(MessageType.Text) // Links are sent as Text type
                .createdAt(LocalDateTime.now())
                .build();

        message = chatRoomMessageRepository.save(message);
        log.info("Meeting link sent successfully");

        return mapToChatMessageResponse(message);
    }

    /**
     * Map ChatRoom entity to ChatRoomResponse DTO
     */
    private ChatRoomResponse mapToChatRoomResponse(ChatRoom chatRoom) {
        List<ChatRoomMessage> messages = chatRoomMessageRepository
                .findByChatRoomOrderByCreatedAtAsc(chatRoom);

        List<ChatMessageResponse> messageResponses = messages.stream()
                .map(this::mapToChatMessageResponse)
                .collect(Collectors.toList());

        boolean canSendMessage = !isRoomReadOnly(chatRoom);

        User learner = chatRoom.getUser();
        Tutor tutor = chatRoom.getTutor();
        User tutorUser = tutor.getUser();

        return ChatRoomResponse.builder()
                .chatRoomID(chatRoom.getChatRoomID())
                .title(chatRoom.getTitle())
                .description(chatRoom.getDescription())
                .userID(learner.getUserID())
                .userName(learner.getFullName() != null ? learner.getFullName() : learner.getEmail())
                .userAvatarURL(learner.getAvatarURL())
                .tutorID(tutor.getTutorID())
                .tutorName(tutorUser.getFullName() != null ? tutorUser.getFullName() : tutorUser.getEmail())
                .tutorAvatarURL(tutorUser.getAvatarURL())
                .chatRoomType(chatRoom.getChatRoomType())
                .messages(messageResponses)
                .canSendMessage(canSendMessage)
                .build();
    }

    /**
     * Map ChatRoomMessage entity to ChatMessageResponse DTO
     */
    private ChatMessageResponse mapToChatMessageResponse(ChatRoomMessage message) {
        User sender = message.getSender();
        return ChatMessageResponse.builder()
                .messageID(message.getMessageID())
                .chatRoomID(message.getChatRoom().getChatRoomID())
                .senderID(sender.getUserID())
                .senderName(sender.getFullName() != null ? sender.getFullName() : sender.getEmail())
                .senderAvatarURL(sender.getAvatarURL())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .createdAt(message.getCreatedAt())
                .build();
    }

    /**
     * Auto-create Training room when Booking is created
     * This should be called from Booking service after creating a booking
     */
    public void ensureTrainingRoomExists(Long learnerID, Long tutorID) {
        log.info("Ensuring Training room exists for Learner {} and Tutor {}", learnerID, tutorID);

        User learner = userRepository.findById(learnerID)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        Tutor tutor = tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        // Check if Training room already exists, if not create it
        if (!chatRoomRepository.existsByUserAndTutorAndChatRoomType(
                learner, tutor, ChatRoomType.Training)) {
            log.info("Auto-creating Training room for Learner {} and Tutor {}", learnerID, tutorID);
            createTrainingRoom(learner, tutor);
        }
    }
}


