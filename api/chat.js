import { chat, streamChat } from "../src/lib/api-handler.js";

export const config = {
  api: { bodyParser: { sizeLimit: "8mb" } }
};

export default async function handler(req, res) {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Device-Id, X-User-Uuid, X-User-Token");
  res.setHeader("Access-Control-Expose-Headers", "X-User-Uuid");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  try {
    const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
    if (url.searchParams.get("stream") === "1" || req.headers.accept?.includes("text/event-stream")) {
      return streamChat(req, res);
    }
    return chat(req, res);
  } catch (error) {
    console.error("[FATAL CRASH]", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
}
