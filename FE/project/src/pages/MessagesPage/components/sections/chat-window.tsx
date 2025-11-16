import { useEffect, useState, useRef } from "react";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Link as LinkIcon,
  Video
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import api from "@/config/axiosConfig";
import { useUserInfo } from "@/hooks/useUserInfo";

interface ChatWindowProps {
  conversationId: number;
}

export type MessageType = "Text" | "Image" | "File";

export interface ChatMessage {
  messageID: number;
  chatRoomID: number;
  senderID: number;
  senderName: string;
  senderAvatarURL: string | null;
  content: string;
  messageType: MessageType;
  createdAt: string;
}

export interface ChatRoom {
  chatRoomID: number;
  title: string;
  description: string;
  userID: number;
  userName: string;
  userAvatarURL: string | null;
  tutorID: number;
  tutorName: string;
  tutorAvatarURL: string | null;
  chatRoomType: "Advice" | "Training";
  createdAt: string | null;
  canSendMessage: boolean;
  allowedMessageTypes: MessageType[];
  messages: ChatMessage[];
}

const ChatWindow = ({ conversationId }: ChatWindowProps) => {
  const [message, setMessage] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);

  const { user: currentUser, loading: userLoading } = useUserInfo();
  const messageListRef = useRef<HTMLDivElement | null>(null);

  /** Auto scroll */
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop =
          messageListRef.current.scrollHeight;
    }
  }, [room?.messages]);

  /** Load chat room */
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/chat/room/${conversationId}`);
        setRoom(res.data.result);
      } catch (err) {
        console.error("Failed to load chat room:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [conversationId]);

  /** Send Message */
  const handleSendMessage = async () => {
    if (!message.trim() || !room?.canSendMessage) return;

    try {
      const res = await api.post("/chat/message", {
        chatRoomID: Number(conversationId),
        content: message,
        messageType: "Text",
      });

      const newMsg = res.data.result as ChatMessage;

      setRoom((prev) =>
          prev
              ? { ...prev, messages: [...prev.messages, newMsg] }
              : null
      );

      setMessage("");
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  /** LOADING STATES */
  if (loading || userLoading) {
    return (
        <div className="flex items-center justify-center h-full text-gray-400">
          Loading...
        </div>
    );
  }

  if (!room || !currentUser) {
    return (
        <div className="flex items-center justify-center h-full text-gray-400">
          Chat room not found
        </div>
    );
  }

  // =====================================================
  // 🔥 Determine OTHER PERSON (chuẩn theo rule)
  // =====================================================

  let otherName = "";
  let otherAvatar = "";

  if (currentUser.userID === room.userID) {
    // currentUser là học viên → hiển thị tutor
    otherName = room.tutorName;
    otherAvatar = room.tutorAvatarURL || "";
  } else if (currentUser.userID === room.tutorID) {
    // currentUser là tutor → hiển thị học viên
    otherName = room.userName;
    otherAvatar = room.userAvatarURL || "";
  } else {
    // fallback nếu không trùng
    otherName = room.userName;
    otherAvatar = room.userAvatarURL || "";
  }

  const isBooked = room.chatRoomType === "Training";
  const canSendMessage = room.canSendMessage;
  const allowedTypes = room.allowedMessageTypes;

  return (
      <div className="flex flex-col h-full max-h-full overflow-hidden">

        {/* HEADER */}
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={otherAvatar} alt={otherName} />
              <AvatarFallback>
                {otherName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="font-semibold">{otherName}</div>

            {isBooked && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Booked
            </span>
            )}
          </div>

          <Button variant="ghost" size="sm" disabled={!isBooked}>
            <Video className="w-5 h-5" />
          </Button>
        </div>

        {/* MESSAGE LIST */}
        <div
            ref={messageListRef}
            className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4 min-h-0"
        >
          {room.messages.map((msg) => {
            const isUser = msg.senderID === currentUser.userID;

            return (
                <div
                    key={msg.messageID}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                          isUser
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-900 shadow-sm"
                      }`}
                  >
                    <p>{msg.content}</p>

                    <p
                        className={`text-xs mt-1 ${
                            isUser ? "text-blue-100" : "text-gray-500"
                        }`}
                    >
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
            );
          })}
        </div>

        {/* INPUT BOX */}
        <div className="p-4 bg-white border-t">
          {!isBooked && (
              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                Book a training session to unlock file sharing, images and Google
                Meet.
              </div>
          )}

          <div className="flex items-end space-x-2">
            {isBooked && (
                <div className="relative">
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAttachments(!showAttachments)}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>

                  {showAttachments && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white shadow-lg rounded-lg p-2 space-y-1 z-10">
                        {allowedTypes.includes("Image") && (
                            <button className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-100 rounded">
                              <ImageIcon className="w-4 h-4" />
                              <span className="text-sm">Send Image</span>
                            </button>
                        )}

                        {allowedTypes.includes("File") && (
                            <button className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-100 rounded">
                              <LinkIcon className="w-4 h-4" />
                              <span className="text-sm">Send File</span>
                            </button>
                        )}
                      </div>
                  )}
                </div>
            )}

            <Textarea
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 min-h-[44px] max-h-32 resize-none"
                rows={1}
                disabled={!canSendMessage}
            />

            <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || !canSendMessage}
                className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
  );
};

export default ChatWindow;
