"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/context/SessionContext";
import { sendMessage } from "@/lib/pungdeApi";
import { exportChatToPDF } from "@/lib/pdfExport";
import { saveChat, getSavedChats, deleteChat } from "@/lib/chatStorage";
import Sidebar from "@/components/Sidebar";
import SaveChatModal from "@/components/SaveChatModal";
import ReactMarkdown from "react-markdown";

export default function Page() {
  const { sessionId, userId, startNewSession } = useSession();
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedChats, setSavedChats] = useState<any[]>([]);
  const [viewingHistory, setViewingHistory] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Load saved chats on client side only
    setSavedChats(getSavedChats());
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    setMessages([
      {
        role: "assistant",
        content: "Namaste 👋 I am Pungda. How can I support your farming today?",
      },
    ]);
  }, [sessionId]);

  const handleSaveChat = (name: string) => {
    saveChat(name, messages);
    setSavedChats(getSavedChats());
  };

  const handleLoadChat = (chat: any) => {
    setMessages(chat.messages);
    setViewingHistory(chat.name);
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    setViewingHistory(null);
    setMessages([
      {
        role: "assistant",
        content: "Namaste 👋 I am Pungda. How can I support your farming today?",
      },
    ]);
    setSidebarOpen(false);
    
    // Create new session with backend
    startNewSession();
  };

  const handleDeleteChat = (id: string) => {
    deleteChat(id);
    setSavedChats(getSavedChats());
    if (viewingHistory) {
      handleNewChat();
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    const userMsg = { role: "user" as const, content: input };
    setMessages((m) => [...m, userMsg]);
    const messageText = input;
    setInput("");
    setIsSending(true);

    await sendMessage({
      userId,
      sessionId,
      text: messageText,
      onAgentResponse: (response) => {
        setMessages((msgs) => [...msgs, { role: "assistant", content: response }]);
      },
    });

    setIsSending(false);
  };

  return (
    <>
      {sidebarOpen && (
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar
        savedChats={savedChats}
        onChatSelect={handleLoadChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
      />

      <div className="chat-page">
        {/* Header */}
        <div className="chat-header">
          <button 
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <img src="/pungda-logo.svg" className="header-logo" alt="Pungda Logo" />
          <div className="header-info">
            <div className="header-name">
              {viewingHistory || (
                <>
                  Pungda
                  <span className="beta-tag">BETA</span>
                </>
              )}
            </div>
            <div className="header-status">
              {viewingHistory ? "Saved Chat" : "AI Farming Assistant"}
            </div>
          </div>
          <div className="header-actions">
            {!viewingHistory && (
              <button
                className="header-btn"
                onClick={() => setShowSaveModal(true)}
                title="Save Chat"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              </button>
            )}
            <button
              className="header-btn"
              onClick={async () => await exportChatToPDF(messages)}
              title="Download PDF"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
        </div>

        {showSaveModal && (
          <SaveChatModal
            onSave={handleSaveChat}
            onClose={() => setShowSaveModal(false)}
          />
        )}

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.role === "assistant" && (
              <img src="/pungda-logo.svg" className="message-avatar ai-avatar" alt="Pungda" />
            )}
            <div className="bubble">
              {msg.role === "assistant" ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
            {msg.role === "user" && (
              <img src="/avatars/farmer1.jpg" className="message-avatar" alt="You" />
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isSending && (
          <div className="message assistant">
            <img src="/pungda-logo.svg" className="message-avatar ai-avatar" alt="Pungda" />
            <div className="bubble typing-bubble">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
      </div>

        {!viewingHistory && (
          <form className="input-bar" onSubmit={send}>
            <input
              type="text"
              placeholder="Message Pungda..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
            />

            <button type="submit" disabled={isSending}>
              {isSending ? <div className="send-spinner"></div> : "Send"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
