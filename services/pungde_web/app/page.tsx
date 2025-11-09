"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/context/SessionContext";
import { sendMessageStream } from "@/lib/pungdeApi";

export default function Page() {
  const { sessionId, userId } = useSession();
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!sessionId) return;
    setMessages([
      {
        role: "assistant",
        content: "Namaste 👋 I am Pungde. How can I support your farming today?",
      },
    ]);
  }, [sessionId]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    const userMsg = { role: "user" as const, content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    let streamedContent = "";

    await sendMessageStream({
      userId,
      sessionId,
      text: userMsg.content,
      onToken: (token) => {
        streamedContent += token;
        setMessages((m) => {
          const updated = [...m];
          updated[updated.length - 1] = { role: "assistant", content: streamedContent };
          return updated;
        });
      },
    });
  };

  return (
    <div className="chat-page">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="bubble">{msg.content}</div>
          </div>
        ))}
      </div>

      <form className="input-bar" onSubmit={send}>
        <input
          type="text"
          placeholder="Message Pungde..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
