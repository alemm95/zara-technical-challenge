import "server-only";

// The API runs on Render's free tier, where a cold start can take about a minute.
export const API_TIMEOUT_MS = 60_000;
export const API_REVALIDATE_SECONDS = 60;

export class ApiError extends Error {
  readonly status: number;

  constructor(
    status: number,
    message = `API request failed with status ${status}.`,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}

function getApiConfig() {
  const baseUrl = process.env.PHONES_API_BASE_URL;
  const apiKey = process.env.PHONES_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "PHONES_API_BASE_URL and PHONES_API_KEY must be configured.",
    );
  }

  const parsedBaseUrl = new URL(baseUrl);
  if (
    parsedBaseUrl.protocol !== "http:" &&
    parsedBaseUrl.protocol !== "https:"
  ) {
    throw new Error("PHONES_API_BASE_URL must use HTTP or HTTPS.");
  }

  return { apiKey, baseUrl: parsedBaseUrl };
}

export async function apiRequest<T>(
  endpoint: string,
  init: RequestInit = {},
): Promise<T> {
  const { apiKey, baseUrl } = getApiConfig();
  const url = new URL(
    endpoint.replace(/^\/+/, ""),
    `${baseUrl.toString().replace(/\/+$/, "")}/`,
  );

  if (url.origin !== baseUrl.origin) {
    throw new Error(
      "API endpoints must use a relative path on the configured API host.",
    );
  }

  const headers = new Headers(init.headers);
  headers.set("x-api-key", apiKey);
  headers.set("accept", headers.get("accept") ?? "application/json");

  const signal = init.signal ?? AbortSignal.timeout(API_TIMEOUT_MS);
  const response = await fetch(url, {
    ...init,
    headers,
    signal,
    next: { revalidate: API_REVALIDATE_SECONDS },
  }).catch((error: unknown) => {
    throw signal.aborted || isAbortError(error)
      ? new ApiError(504, "API request timed out.")
      : new ApiError(502, "API is unreachable.");
  });

  if (!response.ok) {
    throw new ApiError(response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
