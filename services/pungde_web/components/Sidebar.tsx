"use client";
import { useSession } from "@/context/SessionContext";
import { SavedChat } from "@/lib/chatStorage";
import ThemeToggle from "./ThemeToggle";

interface SidebarProps {
  savedChats: SavedChat[];
  onChatSelect: (chat: SavedChat) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isOpen?: boolean;
}

export default function Sidebar({
  savedChats,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  isOpen = false,
}: SidebarProps) {
  const { loading } = useSession();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <span className="logo-text">Pungda</span>
        <div className="sidebar-header-actions">
          <button className="new-chat-btn" onClick={onNewChat} disabled={loading}>
            + New Chat
          </button>
        </div>
      </div>

      <ThemeToggle />

      <div className="chat-list">
        {savedChats.length === 0 ? (
          <div className="chat-list-empty">No saved chats yet</div>
        ) : (
          savedChats.map((chat) => (
            <div key={chat.id} className="chat-item">
              <div className="chat-item-clickable" onClick={() => onChatSelect(chat)}>
                <img
                  src="/pungda-logo.svg"
                  className="chat-avatar"
                  alt="Pungda"
                />
                <div className="chat-text">
                  <div className="chat-name">{chat.name}</div>
                  <div className="chat-preview">
                    {new Date(chat.savedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button
                className="chat-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                title="Delete chat"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
