// layout.tsx
"use client";

import { SessionProvider, useSession } from "@/context/SessionContext";
import "./globals.css";

function SessionGate({ children }: { children: React.ReactNode }) {
  const { loading, error, retrySession } = useSession();

  return (
    <>
      {error && (
        <div className="error-popup">
          {error}
          <button onClick={retrySession} style={{ marginLeft: 12 }}>
            Retry
          </button>
        </div>
      )}
      <div style={{ display: "flex", height: "100vh" }}>
        {children}
        {loading && (
          <div className="chat-loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <SessionProvider>
          <SessionGate>{children}</SessionGate>
        </SessionProvider>
      </body>
    </html>
  );
}
