const API_BASE = "https://pungde-ai-802772821263.us-central1.run.app";

export async function createSession(userId: string): Promise<string> {
  const res = await fetch(
    `${API_BASE}/apps/pungde_agent/users/${userId}/sessions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }
  );

  const data = await res.json();
  return data.id; // ✅ Correct key
}

export async function sendMessage({
  userId,
  sessionId,
  text,
  onAgentResponse,
}: {
  userId: string;
  sessionId: string;
  text: string;
  onAgentResponse: (response: string) => void;
}) {
  const response = await fetch(`${API_BASE}/run_sse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
    body: JSON.stringify({
      app_name: "pungde_agent",
      user_id: userId,
      session_id: sessionId,
      newMessage: {
        role: "user",
        parts: [{ text }],
      }
    }),
  });

  if (!response.ok || !response.body) {
    console.error("SSE failed:", response.status, await response.text());
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;

      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      try {
        const json = JSON.parse(payload);

        // Only process complete (non-partial) messages
        if (json.partial !== true && json.content?.parts?.length) {
          const fullMessage = json.content.parts
            .map((p: any) => p.text || "")
            .join("");

          if (fullMessage) {
            onAgentResponse(fullMessage);
          }
        }

      } catch (err) {
        // ignore JSON parsing errors for non-payload lines
      }
    }
  }
}



