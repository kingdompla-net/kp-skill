import { z } from "zod";
import { app } from "@/config/app";
import { kpEnvelopeSchema, refreshResponseSchema } from "@/schema/authentication";

export class KpError extends Error {
  status: number;
  // The raw server message, kept for control flow only; users see `message`.
  serverMessage: string;

  constructor(message: string, status: number, serverMessage = "") {
    super(message);
    this.name = "KpError";
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

interface TokenBinding {
  get: () => string | null;
  getGeneration: () => number;
  set: (accessToken: string) => void;
  onExpired: () => void;
}

const memberRequiredPattern = /member required/i;

// A signed-in user who has not joined the app gets "Unauthorized: Member required",
// whatever the HTTP status, and the display message may be generic for some statuses.
export const isMemberRequired = (error: unknown) => error instanceof KpError && memberRequiredPattern.test(error.serverMessage);

// Joining twice answers "User already a member of the app"; that is a success for our purpose.
export const isAlreadyMember = (error: unknown) => error instanceof KpError && /already a member/i.test(error.serverMessage);

let binding: TokenBinding | null = null;
let refreshing: { owner: TokenBinding; generation: number; promise: Promise<string | null> } | null = null;

// The session store registers itself here so this client stays independent of React state modules.
export const bindKpToken = (next: TokenBinding) => {
  binding = next;
  return () => {
    if (binding === next) binding = null;
  };
};

interface RequestOption {
  timeoutMs?: number;
  anonymous?: boolean;
  baseUrl?: string;
  auth?: boolean;
  body?: unknown;
  method?: "GET" | "POST";
  query?: Record<string, string>;
}

export const KP_API_VERSION = `/${app.kpApiVersion}`;

export const buildUrl = (path: string, query: Record<string, string> = {}, baseUrl = app.kpApiBaseUrl, anonymous = false) => {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}${KP_API_VERSION}${path}`);
  if (!anonymous) url.searchParams.set("app_id", app.kpAppId);
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
};

const refreshAccessToken = (owner: TokenBinding, generation: number): Promise<string | null> => {
  if (refreshing?.owner === owner && refreshing.generation === generation) return refreshing.promise;
  const promise = (async () => {
    try {
      // The refresh token lives in a KP cookie, so credentials must be included.
      const response = await fetch(buildUrl("/auth/user/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) return null;
      const envelope = kpEnvelopeSchema.parse(await response.json());
      const parsed = refreshResponseSchema.safeParse(envelope.data);
      if (!envelope.is_ok || !parsed.success) return null;
      if (binding !== owner || owner.getGeneration() !== generation) return null;
      owner.set(parsed.data.access_token);
      return parsed.data.access_token;
    } catch {
      return null;
    } finally {
      if (refreshing?.promise === promise) refreshing = null;
    }
  })();
  refreshing = { owner, generation, promise };
  return promise;
};

const send = async (path: string, option: RequestOption, token: string | null) => {
  const controller = option.timeoutMs ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), option.timeoutMs) : undefined;
  try {
    return await fetch(buildUrl(path, option.query, option.baseUrl, option.anonymous), {
      method: option.method || (option.body ? "POST" : "GET"),
      credentials: option.anonymous ? "omit" : "include",
      signal: controller?.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: option.body ? JSON.stringify(option.body) : undefined,
    });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
};

const toMessage = (status: number, serverMessage?: string) => {
  if (status === 401) return serverMessage || "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to do that.";
  return serverMessage || "The KP service could not complete the request.";
};

// Common KP call: Bearer header, one refresh retry on 401, schema-validated data.
export const kpRequest = async <T>(path: string, schema: z.ZodType<T>, option: RequestOption = {}): Promise<T> => {
  const useAuth = !option.anonymous && option.auth !== false;
  const owner = useAuth ? binding : null;
  const generation = owner?.getGeneration();
  const assertCurrent = () => {
    if (!owner) return;
    if (binding !== owner || owner.getGeneration() !== generation) throw new KpError("Your account changed. Please sign in again.", 401);
  };
  let token = owner?.get() ?? null;
  let response: Response;

  try {
    response = await send(path, option, token);
    assertCurrent();
    // Member-required is not an expired token, so skip the refresh and let the caller join.
    const memberRequired =
      response.status === 401 &&
      memberRequiredPattern.test(
        await response
          .clone()
          .text()
          .catch(() => ""),
      );
    const hasSession = Boolean(owner && token);
    const canRefresh = response.status === 401 && !memberRequired;
    assertCurrent();
    if (hasSession && canRefresh) {
      token = await refreshAccessToken(owner, generation);
      assertCurrent();
      if (!token) {
        owner.onExpired();
        throw new KpError(toMessage(401), 401);
      }
      response = await send(path, option, token);
      assertCurrent();
    }
  } catch (error) {
    if (error instanceof KpError) throw error;
    throw new KpError("Network error. Check your connection and try again.", 0);
  }

  const payload: unknown = await response.json().catch(() => null);
  assertCurrent();
  const envelope = kpEnvelopeSchema.safeParse(payload);
  const serverMessage = envelope.success ? envelope.data.message : undefined;

  if (!response.ok || !envelope.success || !envelope.data.is_ok) {
    if (import.meta.env.DEV) {
      console.error(`[KP] ${option.method || (option.body ? "POST" : "GET")} ${path} -> ${response.status}`);
    }
    const sessionRejected = response.status === 401 && useAuth;
    if (sessionRejected && !memberRequiredPattern.test(serverMessage ?? "")) {
      owner?.onExpired();
    }
    throw new KpError(toMessage(response.status, serverMessage), response.status, serverMessage ?? "");
  }

  const parsed = schema.safeParse(envelope.data.data);
  if (!parsed.success) throw new KpError("Unexpected response from the KP service.", 502);
  return parsed.data;
};
