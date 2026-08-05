import { json, methodNotAllowed } from "./_shared/http.mts";

export default async (request: Request) => {
  if (request.method !== "GET") return methodNotAllowed("GET");
  return json({
    qualities: [
      { id: "realtime", label: "Real-time Intelligence", description: "Fast synchronization across connected services." },
      { id: "ai-native", label: "AI-Native", description: "Server-side AI integrations keep provider credentials private." },
      { id: "tactical", label: "Tactical Design", description: "Focused tools for high-performance content operations." },
      { id: "secure", label: "Secure Vault", description: "Environment-backed integrations avoid shipping private keys to browsers." },
    ],
  });
};
