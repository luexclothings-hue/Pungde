"use client";
import { useSession } from "@/context/SessionContext";

export default function Sidebar() {
  const { startNewSession } = useSession();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="logo-text">Pungde</span>
        <button className="new-chat-btn" onClick={startNewSession}>+ New Chat</button>
      </div>

      <div className="chat-list">

        <div className="chat-item">
          <img src="/avatars/farmer1.jpg" className="chat-avatar" alt="" />
          <div className="chat-text">
            <div className="chat-name">Banana Farm Advisory</div>
            <div className="chat-preview">Last message preview…</div>
          </div>
        </div>

        <div className="chat-item">
          <img src="/avatars/farmer2.jpg" className="chat-avatar" alt="" />
          <div className="chat-text">
            <div className="chat-name">Soil Health Monitoring</div>
            <div className="chat-preview">Last message preview…</div>
          </div>
        </div>

      </div>
    </aside>
  );
}
