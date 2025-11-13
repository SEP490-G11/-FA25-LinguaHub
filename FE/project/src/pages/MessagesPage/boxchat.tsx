import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ConversationsList from "./components/sections/conversations-list";
import ChatWindow from "./components/sections/chat-window";

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  // convert URL param thành number hoặc null
  const initialRoomId = conversationId ? Number(conversationId) : null;

  const [selectedConversation, setSelectedConversation] = useState<number | null>(
      initialRoomId
  );

  // Khi URL thay đổi → cập nhật selectedConversation
  useEffect(() => {
    if (conversationId) {
      setSelectedConversation(Number(conversationId));
    }
  }, [conversationId]);

  // Khi user chọn room bên trái → update URL
  const handleSelectConversation = (roomId: number) => {
    setSelectedConversation(roomId);
    navigate(`/messages/${roomId}`);
  };

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              style={{ height: "calc(100vh - 8rem)" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 h-full">
              {/* LEFT COLUMN: Conversations list */}
              <ConversationsList
                  selectedConversation={selectedConversation}
                  onSelectConversation={handleSelectConversation}
              />

              {/* RIGHT COLUMN: Chat window */}
              <div className="md:col-span-2">
                {selectedConversation ? (
                    <ChatWindow conversationId={selectedConversation} />
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <div className="text-6xl mb-4">💬</div>
                        <p className="text-xl">Select a conversation to start messaging</p>
                      </div>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Messages;
