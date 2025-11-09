"use client";
import { SavedChat } from "@/lib/chatStorage";

interface HistoryPanelProps {
  chats: SavedChat[];
  onLoad: (chat: SavedChat) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function HistoryPanel({
  chats,
  onLoad,
  onDelete,
  onClose,
}: HistoryPanelProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="history-panel" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <h3 className="history-title">Saved Chats</h3>
          <button className="history-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="history-list">
          {chats.length === 0 ? (
            <div className="history-empty">No saved chats yet</div>
          ) : (
            chats.map((chat) => (
              <div key={chat.id} className="history-item">
                <div className="history-item-info" onClick={() => onLoad(chat)}>
                  <div className="history-item-name">{chat.name}</div>
                  <div className="history-item-date">
                    {new Date(chat.savedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  className="history-item-delete"
                  onClick={() => onDelete(chat.id)}
                  title="Delete chat"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
