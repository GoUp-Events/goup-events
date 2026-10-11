import { API_BASE_URL } from "@/config";
import { toast } from "sonner";
import type {
  AuthResponse,
  Category,
  Event,
  EventInput,
  Favorite,
  FieldError,
  Nearby,
  Plan,
  PlaceSuggestion,
  Recommendation,
  User,
} from "./models";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: FieldError[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export function errorMessage(status: number, message?: string) {
  return (
    message ||
    (status === 502
      ? "O assistente/Google está indisponível agora. Tente novamente em instantes."
      : "Não foi possível concluir agora. Tente novamente em instantes.")
  );
}
export async function request<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    token?: string | undefined;
    signal?: AbortSignal | undefined;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      ...(options.signal ? { signal: options.signal } : {}),
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    const message = "Não consegui falar com o servidor do GoUp.";
    toast.error(message);
    throw new ApiError(message, 0);
  }
  const text = await response.text();
  let data: { message?: string; errors?: FieldError[] } | undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }
  if (!response.ok) {
    if (response.status === 401 && options.token) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("goup-token");
        window.dispatchEvent(new globalThis.Event("goup-session-expired"));
      }
      toast.error("Sua sessão expirou");
      throw new ApiError("Sua sessão expirou", 401);
    }
    const message = errorMessage(response.status, data?.message);
    toast.error(message);
    throw new ApiError(message, response.status, data?.errors ?? []);
  }
  return data as T;
}
export type Filters = {
  q?: string | undefined;
  city?: string | undefined;
  categoryId?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  maxPrice?: string | undefined;
  categoryIds?: string | undefined;
  freeOnly?: string | undefined;
  ageRating?: string | undefined;
  sort?: string | undefined;
};
export function queryString(filters: Filters | Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, value);
  });
  return params.size ? `?${params}` : "";
}
export const api = {
  categories: () => request<Category[]>("/categories"),
  placeSuggestions: (q: string, token: string, signal?: AbortSignal) =>
    request<PlaceSuggestion[]>(`/locations/autocomplete${queryString({ q })}`, { token, signal }),
  plans: () => request<Plan[]>("/plans"),
  events: (filters: Filters = {}, token?: string) =>
    request<Event[]>(`/events${queryString(filters)}`, { token }),
  event: (id: string, token?: string) => request<Event>(`/events/${id}`, { token }),
  nearby: (id: string, type?: string, token?: string) =>
    request<Nearby[]>(`/events/${id}/nearby${queryString({ type })}`, { token }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body }),
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body }),
  me: (token: string) => request<User>("/users/me", { token }),
  mine: (token: string) => request<Event[]>("/users/me/events", { token }),
  favorites: (token: string) => request<Favorite[]>("/users/me/favorites", { token }),
  favorite: (id: number, remove: boolean, token: string) =>
    request<void>(`/events/${id}/favorite`, { method: remove ? "DELETE" : "POST", token }),
  save: (body: EventInput, token: string, id?: string) =>
    request<Event>(id ? `/events/${id}` : "/events", { method: id ? "PUT" : "POST", body, token }),
  delete: (id: number, token: string) =>
    request<void>(`/events/${id}`, { method: "DELETE", token }),
  recommendations: (token: string) =>
    request<Recommendation[]>("/users/me/recommendations", { token }),
  discovery: (body: { message: string; city?: string }, token: string) =>
    request<{ summary: string; events: Event[] }>("/discovery", { method: "POST", body, token }),
};
