"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createSession } from "@/lib/pungdeApi";

const SessionContext = createContext<any>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const userId = "guest";
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const id = await createSession(userId);
      setSessionId(id);
    })();
  }, []);

  const startNewSession = async () => {
    const id = await createSession(userId);
    setSessionId(id);
  };

  return (
    <SessionContext.Provider value={{ sessionId, startNewSession, userId }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
