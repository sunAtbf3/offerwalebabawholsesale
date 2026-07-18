import axios from "axios";

export const WHOLESALE_USER_ACCESS_TOKEN_KEY = "wholesaleUserAccessToken";
export const WHOLESALE_ADMIN_ACCESS_TOKEN_KEY = "wholesaleAdminAccessToken";
export const AUTH_CONTEXT_USER = "wholesale-user";
export const AUTH_CONTEXT_ADMIN = "wholesale-admin";

/** Refresh access token this many ms before JWT exp (avoids visible 401 cliff). */
const REFRESH_BEFORE_EXPIRY_MS = 90 * 1000;

const proactiveRefreshTimers = {
  [AUTH_CONTEXT_USER]: null,
  [AUTH_CONTEXT_ADMIN]: null,
};

/** One in-flight refresh per context — prevents rotation races (SESSION_EXPIRED). */
const refreshInFlight = {
  [AUTH_CONTEXT_USER]: null,
  [AUTH_CONTEXT_ADMIN]: null,
};

const refreshWaitQueues = {
  [AUTH_CONTEXT_USER]: [],
  [AUTH_CONTEXT_ADMIN]: [],
};

const getAuthContext = (config = {}) => {
  const rawContext = config?.authContext;
  if (rawContext) {
    return String(rawContext).trim().toLowerCase() === AUTH_CONTEXT_ADMIN
      ? AUTH_CONTEXT_ADMIN
      : AUTH_CONTEXT_USER;
  }

  const requestUrl = String(config?.url || "").trim().toLowerCase();
  const isAdminApiCall =
    requestUrl.startsWith("/admin") ||
    requestUrl.includes("/admin/") ||
    requestUrl.startsWith("/staff") ||
    requestUrl.includes("/staff/");
  if (isAdminApiCall) {
    return AUTH_CONTEXT_ADMIN;
  }

  const hasAdminToken = Boolean(localStorage.getItem(WHOLESALE_ADMIN_ACCESS_TOKEN_KEY));
  const hasUserToken = Boolean(localStorage.getItem(WHOLESALE_USER_ACCESS_TOKEN_KEY));
  const adminRouteActive =
    typeof window !== "undefined" &&
    (/^\/babapanel(\/|$)/.test(window.location.pathname) ||
      /^\/babadash(\/|$)/.test(window.location.pathname));
  if (adminRouteActive && hasAdminToken) {
    return AUTH_CONTEXT_ADMIN;
  }
  if (hasAdminToken && !hasUserToken) {
    // Single active session is admin; keep refresh portal aligned.
    return AUTH_CONTEXT_ADMIN;
  }

  return AUTH_CONTEXT_USER;
};

const getTokenStorageKey = (authContext) => {
  return authContext === AUTH_CONTEXT_ADMIN
    ? WHOLESALE_ADMIN_ACCESS_TOKEN_KEY
    : WHOLESALE_USER_ACCESS_TOKEN_KEY;
};

const getLogoutEventName = (authContext) => {
  return authContext === AUTH_CONTEXT_ADMIN
    ? "auth:logout:wholesale-admin"
    : "auth:logout:wholesale-user";
};

const getPortalForAuthContext = (authContext) => {
  return authContext === AUTH_CONTEXT_ADMIN ? "admin-wholesale" : "wholesale";
};

function getAccessTokenExpiryMs(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload?.exp) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

function clearProactiveRefreshTimer(authContext) {
  const existing = proactiveRefreshTimers[authContext];
  if (existing) {
    clearTimeout(existing);
    proactiveRefreshTimers[authContext] = null;
  }
}

function drainRefreshQueue(authContext, error, token = null) {
  const queue = refreshWaitQueues[authContext];
  refreshWaitQueues[authContext] = [];
  queue.forEach((entry) => {
    if (error) {
      entry.reject(error);
    } else {
      entry.resolve(token);
    }
  });
}

async function performRefreshRequest(authContext) {
  const tokenStorageKey = getTokenStorageKey(authContext);
  const res = await wholesaleAxios.post(
    "/auth/refresh",
    { portal: getPortalForAuthContext(authContext) },
    { authContext, skipAuthRefresh: true }
  );
  const newToken = res.data?.accessToken;
  if (!newToken) {
    throw new Error("Refresh response missing accessToken");
  }
  localStorage.setItem(tokenStorageKey, newToken);
  notifyAccessTokenStored(authContext);
  return newToken;
}

/**
 * Single-flight refresh per context (admin vs user never share one lock).
 */
export function enqueueTokenRefresh(authContext) {
  if (refreshInFlight[authContext]) {
    return refreshInFlight[authContext];
  }

  refreshInFlight[authContext] = (async () => {
    try {
      const token = await performRefreshRequest(authContext);
      drainRefreshQueue(authContext, null, token);
      return token;
    } catch (error) {
      drainRefreshQueue(authContext, error, null);
      throw error;
    } finally {
      refreshInFlight[authContext] = null;
    }
  })();

  return refreshInFlight[authContext];
}

/**
 * Schedule silent refresh before access JWT expires. Call after login / refresh / page load.
 */
export function notifyAccessTokenStored(authContext) {
  if (typeof window === "undefined") return;

  clearProactiveRefreshTimer(authContext);

  const storageKey = getTokenStorageKey(authContext);
  const token = localStorage.getItem(storageKey);
  const expMs = getAccessTokenExpiryMs(token);
  if (!expMs) return;

  const delay = Math.max(expMs - Date.now() - REFRESH_BEFORE_EXPIRY_MS, 5000);

  proactiveRefreshTimers[authContext] = setTimeout(() => {
    proactiveRefreshTimers[authContext] = null;
    enqueueTokenRefresh(authContext).catch(() => {
      // Reactive 401 path will retry; avoid forced logout on proactive race failure.
    });
  }, delay);
}

export function clearAccessTokenSchedule(authContext) {
  clearProactiveRefreshTimer(authContext);
}

let isLoggingOut = false;
export const setLoggingOut = (val) => {
  isLoggingOut = val;
};

const RAW_BACKEND_BASE_URL = String(import.meta.env.VITE_BACKEND_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");

if (!RAW_BACKEND_BASE_URL) {
  throw new Error(
    "VITE_BACKEND_BASE_URL is not defined. Set it in your .env file (e.g. /api with Vite proxy, or http://localhost:8081/api)."
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Wholesale Axios Instance
// Every request automatically carries `x-storefront: wholesale` so the backend
// knows to respond with wholesale pricing (MOQ, bulk tiers, etc.)
// ─────────────────────────────────────────────────────────────────────────────

const wholesaleAxios = axios.create({
  baseURL: RAW_BACKEND_BASE_URL,
  timeout: 15000,
  withCredentials: true, // sends refreshToken cookie
  headers: {
    "Content-Type": "application/json",
    "x-storefront": "wholesale", // ← backend reads this to return wholesale data
  },
});

// ── Request Interceptor — attach accessToken ──────────────────────────────────
wholesaleAxios.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    // Strict admin storefront scope middleware requires explicit storefront header.
    config.headers["x-storefront"] = "wholesale";

    const authContext = getAuthContext(config);
    config.authContext = authContext;

    // Let the browser set multipart boundary for FormData uploads (reviews, proofs, etc.)
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    const token =
      localStorage.getItem(getTokenStorageKey(authContext)) ||
      localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — auto-refresh on 401 / selected 403 ────────────────
wholesaleAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    if (originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }

    const authContext = getAuthContext(originalRequest);
    const tokenStorageKey = getTokenStorageKey(authContext);
    const requestUrl = String(originalRequest?.url || "");

    const isAuthFailure =
      error.response?.status === 401 ||
      (error.response?.status === 403 &&
        ["PORTAL_ACCESS_DENIED", "INSUFFICIENT_ADMIN_ROLE"].includes(
          error.response?.data?.code
        ));

    if (
      isAuthFailure &&
      !originalRequest._retry &&
      !isLoggingOut &&
      !requestUrl.includes("/auth/refresh") &&
      !requestUrl.includes("/auth/login") &&
      !requestUrl.includes("/auth/logout")
    ) {
      if (refreshInFlight[authContext]) {
        return new Promise((resolve, reject) => {
          refreshWaitQueues[authContext].push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return wholesaleAxios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;

      try {
        const newToken = await enqueueTokenRefresh(authContext);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return wholesaleAxios(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem(tokenStorageKey);
        clearAccessTokenSchedule(authContext);
        window.dispatchEvent(new Event(getLogoutEventName(authContext)));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

if (typeof window !== "undefined") {
  if (localStorage.getItem(WHOLESALE_ADMIN_ACCESS_TOKEN_KEY)) {
    notifyAccessTokenStored(AUTH_CONTEXT_ADMIN);
  }
  if (localStorage.getItem(WHOLESALE_USER_ACCESS_TOKEN_KEY)) {
    notifyAccessTokenStored(AUTH_CONTEXT_USER);
  }
}

export default wholesaleAxios;
