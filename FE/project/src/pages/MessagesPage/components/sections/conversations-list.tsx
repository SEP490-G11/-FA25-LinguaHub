import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import api from "@/config/axiosConfig";

interface ConversationsListProps {
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
}

interface ChatRoom {
  chatRoomID: number;
  tutorName: string;
  tutorAvatarURL: string | null;
  userName: string;
  userAvatarURL: string | null;
  chatRoomType: "Advice" | "Training";
  messages: {
    messageID: number;
    content: string;
    createdAt: string;
  }[];
}

const ConversationsList = ({
                             selectedConversation,
                             onSelectConversation,
                           }: ConversationsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [myInfo, setMyInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load current user info
  useEffect(() => {
    api
        .get("/users/myInfo")
        .then((res) => setMyInfo(res.data.result))
        .catch(() => {});
  }, []);

  // Load chat rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/chat/rooms");
        setRooms(res.data?.result || []);
      } catch (err) {
        console.error("❌ Error loading chat rooms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (!myInfo) {
    return (
        <div className="p-4 text-center text-gray-500 border-r h-full">
          Loading...
        </div>
    );
  }

  const isTutor = myInfo.role === "Tutor";

  const filteredRooms = rooms.filter((room) => {
    const displayName = isTutor ? room.userName : room.tutorName;
    return displayName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
      <div className="border-r border-gray-200 flex flex-col h-full bg-[#F0F9FF]">
        {/* HEADER */}
        <div className="p-4 border-b border-blue-100 bg-white/80 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-4 text-blue-900">Messages</h2>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
            <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-blue-200 focus:ring-blue-300"
            />
          </div>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
              <div className="p-4 text-center text-blue-500">Loading conversations...</div>
          )}

          {!loading && filteredRooms.length === 0 && (
              <div className="p-4 text-center text-gray-500">No conversations found.</div>
          )}

          {!loading &&
              filteredRooms.map((room) => {
                const displayName = isTutor ? room.userName : room.tutorName;
                const displayAvatar = isTutor
                    ? room.userAvatarURL
                    : room.tutorAvatarURL;

                const lastMessage = room.messages?.[room.messages.length - 1];
                const lastMsgText = lastMessage?.content || "No messages yet";

                const lastMsgTime = lastMessage
                    ? new Date(lastMessage.createdAt).toLocaleString()
                    : "—";

                const hasBooking = room.chatRoomType === "Training";

                const isSelected =
                    selectedConversation === String(room.chatRoomID);

                return (
                    <div
                        key={room.chatRoomID}
                        onClick={() => onSelectConversation(String(room.chatRoomID))}
                        className={`p-4 border-b border-blue-100 cursor-pointer transition-all ${
                            isSelected
                                ? "bg-blue-100 shadow-inner"
                                : "hover:bg-blue-50 hover:shadow-sm"
                        }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="border border-blue-300 shadow-sm">
                          <AvatarImage src={displayAvatar || ""} alt={displayName} />
                          <AvatarFallback className="bg-blue-200 text-blue-700 font-bold">
                            {displayName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-sm text-blue-900 truncate">
                              {displayName}
                            </h3>
                            <span className="text-xs text-blue-500">{lastMsgTime}</span>
                          </div>

                          <p className="text-sm text-gray-600 truncate">{lastMsgText}</p>

                          {hasBooking && (
                              <div className="mt-1">
                        <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full">
                          Booked
                        </span>
                              </div>
                          )}
                        </div>
                      </div>
                    </div>
                );
              })}
        </div>
      </div>
  );
};

export default ConversationsList;
