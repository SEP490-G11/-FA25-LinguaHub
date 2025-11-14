import React, { useEffect, useState, useRef } from "react";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Link as LinkIcon,
  Video,
  MoreVertical,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import api from "@/config/axiosConfig";

interface ChatWindowProps {
  conversationId: string;
}

const ChatWindow = ({ conversationId }: ChatWindowProps) => {
  const [message, setMessage] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load room details + messages
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/chat/room/${conversationId}`);
        setRoom(res.data.result);
      } catch (err) {
        console.error("❌ Failed to load chat room:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [conversationId]);

  // Auto scroll khi messages thay đổi
  useEffect(scrollToBottom, [room]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const res = await api.post("/chat/message", {
        chatRoomID: Number(conversationId),
        content: message,
        messageType: "Text",
      });

      setRoom((prev: any) => ({
        ...prev,
        messages: [...prev.messages, res.data.result],
      }));

      setMessage("");
      scrollToBottom();
    } catch (err) {
      console.error("❌ Send message failed:", err);
    }
  };

  if (loading)
    return (
        <div className="flex items-center justify-center h-full text-gray-400">
          Loading chat...
        </div>
    );

  if (!room)
    return (
        <div className="flex items-center justify-center h-full text-gray-400">
          Chat room not found
        </div>
    );

  const isTrainingRoom = room.chatRoomType === "Training";

  return (
      <div className="flex flex-col h-full">
        {/* HEADER — giữ nguyên UI */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar>
                <AvatarImage src={room.tutorAvatarURL} alt={room.tutorName} />
                <AvatarFallback>
                  {room.tutorName?.split(" ").map((n: string) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </div>

            <div>
              <h3 className="font-semibold">{room.tutorName}</h3>
              <p className="text-xs text-gray-500">
                {room.isOnline ? "Online" : "Offline"}
              </p>
            </div>

            {isTrainingRoom && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Booked
            </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* MESSAGE LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {room.messages.map((msg: any) => {
            const isUser = msg.senderID === room.userID;

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
                    {msg.messageType === "Image" && (
                        <img
                            src={msg.content}
                            className="rounded-lg mb-2 max-w-full h-auto"
                        />
                    )}

                    {msg.messageType === "File" && (
                        <a
                            href={msg.content}
                            className="underline text-sm"
                            target="_blank"
                        >
                          Download File
                        </a>
                    )}

                    {msg.messageType === "Text" && <p>{msg.content}</p>}

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

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BOX */}
        <div className="p-4 bg-white border-t border-gray-200">
          {!isTrainingRoom && (
              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                Book a session to unlock image and file sharing.
              </div>
          )}

          <div className="flex items-end space-x-2">
            {isTrainingRoom && (
                <div className="relative">
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAttachments(!showAttachments)}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>

                  {showAttachments && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white shadow-lg rounded-lg p-2 space-y-1">
                        <button className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-100 rounded">
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-sm">Send Image</span>
                        </button>
                        <button className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-100 rounded">
                          <LinkIcon className="w-4 h-4" />
                          <span className="text-sm">Send File</span>
                        </button>
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
            />

            <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
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
