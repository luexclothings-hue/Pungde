// SessionContext.tsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { createSession } from "@/lib/pungdeApi";

interface SessionContextType {
  sessionId: string | null;
  userId: string;
  loading: boolean;
  error: string | null;
  retrySession: () => void;
  startNewSession: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId] = useState("guest"); // You may change later
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function initSession() {
    setLoading(true);
    setError(null);

    try {
      const id = await createSession(userId);
      setSessionId(id);
    } catch (err) {
      setError("Unable to connect. Please check your connection.");
    }

    setLoading(false);
  }

  useEffect(() => {
    initSession();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        userId,
        loading,
        error,
        retrySession: initSession,
        startNewSession: initSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext)!;
