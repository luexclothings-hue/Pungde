// layout.tsx
"use client";

import { SessionProvider, useSession } from "@/context/SessionContext";
import { ThemeProvider } from "@/context/ThemeContext";
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
    <html lang="en">
      <head>
        <title>Pungda - AI Farming Assistant</title>
        <meta name="description" content="Pungda is your intelligent farming companion, providing expert agricultural advice and support powered by AI." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/pungda-icon.svg" type="image/svg+xml" />
      </head>
      <body>
        <ThemeProvider>
          <SessionProvider>
            <SessionGate>{children}</SessionGate>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
