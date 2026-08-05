export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

export const methodNotAllowed = (allowed: string) =>
  new Response("Method not allowed", {
    status: 405,
    headers: { allow: allowed },
  });

export async function readJson<T>(request: Request): Promise<T> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Content-Type must be application/json");
  }
  return request.json() as Promise<T>;
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unexpected server error";
