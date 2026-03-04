type JsonBody = object | null;

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const defaultBaseUrl = "http://localhost:3000/api/v1";

const baseUrl =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL)
    : defaultBaseUrl;

const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: JsonBody;
  skipAuthRefresh?: boolean;
};

const authRefreshPath = "/auth/refresh";
const authBypassPaths = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
]);

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${baseUrl}${authRefreshPath}`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...defaultHeaders,
        },
      });

      const contentType = response.headers.get("content-type");
      const hasJsonBody = contentType?.includes("application/json");
      const responseBody = hasJsonBody ? await response.json() : undefined;

      if (!response.ok) {
        const message =
          (responseBody && ("message" in (responseBody as Record<string, unknown>)
            ? (responseBody as Record<string, unknown>).message
            : undefined)) ||
          response.statusText ||
          "Unexpected API error";

        throw new ApiError(
          Array.isArray(message) ? message.join(", ") : String(message),
          response.status,
          responseBody,
        );
      }
    })()
      .finally(() => {
        refreshPromise = null;
      });
  }

  await refreshPromise;
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { body, headers, skipAuthRefresh, ...rest } = options;
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: "include",
    ...rest,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (
    response.status === 401 &&
    !skipAuthRefresh &&
    !authBypassPaths.has(path)
  ) {
    await refreshAccessToken();
    return apiRequest(path, { ...options, skipAuthRefresh: true });
  }

  const contentType = response.headers.get("content-type");
  const hasJsonBody = contentType?.includes("application/json");
  const responseBody = hasJsonBody ? await response.json() : undefined;

  if (!response.ok) {
    const message =
      (responseBody && ("message" in (responseBody as Record<string, unknown>)
        ? (responseBody as Record<string, unknown>).message
        : undefined)) ||
      response.statusText ||
      "Unexpected API error";

    throw new ApiError(
      Array.isArray(message) ? message.join(", ") : String(message),
      response.status,
      responseBody,
    );
  }

  return responseBody as TResponse;
}
