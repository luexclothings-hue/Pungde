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

export async function sendMessageStream({
  userId,
  sessionId,
  text,
  onToken,
}: {
  userId: string;
  sessionId: string;
  text: string;
  onToken: (token: string) => void;
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
      },
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

    // split into lines; keep the last partial in buffer
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;

      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      try {
        const json = JSON.parse(payload);

        // case 1: token deltas
        if (json?.delta?.text) {
          onToken(json.delta.text);
          continue;
        }

        // case 2: full message objects (your current server output)
        if (json?.content?.parts?.length) {
          const textParts = json.content.parts
            .map((p: any) => p?.text)
            .filter(Boolean)
            .join("");
          if (textParts) onToken(textParts);
          continue;
        }

        // optionally: handle other shapes here if needed
      } catch (e) {
        // ignore non-JSON / keep streaming
      }
    }
  }
}


