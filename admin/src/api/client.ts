import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function adminFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...rest } = options;

  let url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  }

  const token = localStorage.getItem("yard_admin_token");

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string> || {}),
  };

  try {
    const res = await fetch(url, {
      ...rest,
      headers: authHeaders,
    });

    if (res.status === 401) {
      localStorage.removeItem("yard_admin_token");
      localStorage.removeItem("yard_admin_user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      throw new Error("Unauthorized — Admin session expired.");
    }

    if (res.status === 403) {
      throw new Error("Forbidden — Admin role required.");
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || json.error?.message || `HTTP error ${res.status}`);
    }

    // Handle envelope { data: ... } or raw payload
    return json.data !== undefined ? json.data : json;
  } catch (err: any) {
    throw err;
  }
}
