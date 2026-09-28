import "server-only";

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

  const response = await fetch(url, {
    ...init,
    cache: init.cache ?? "no-store",
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}.`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
