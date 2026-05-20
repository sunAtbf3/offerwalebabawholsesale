import axios from "axios";

export const WHOLESALE_USER_ACCESS_TOKEN_KEY = "wholesaleUserAccessToken";
export const WHOLESALE_ADMIN_ACCESS_TOKEN_KEY = "wholesaleAdminAccessToken";
export const AUTH_CONTEXT_USER = "wholesale-user";
export const AUTH_CONTEXT_ADMIN = "wholesale-admin";

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

// ─────────────────────────────────────────────────────────────────────────────
// Wholesale Axios Instance
// Every request automatically carries `X-Store-Type: wholesale` so the backend
// knows to respond with wholesale pricing (MOQ, bulk tiers, etc.)
// ─────────────────────────────────────────────────────────────────────────────

const wholesaleAxios = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
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

// ── Response Interceptor — auto-refresh on 401 ───────────────────────────────
let isRefreshing = false;
let failedQueue = [];
let isLoggingOut = false; // 👈 add this flag
export const setLoggingOut = (val) => { isLoggingOut = val; };

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

wholesaleAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authContext = getAuthContext(originalRequest);
    const tokenStorageKey = getTokenStorageKey(authContext);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoggingOut &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/login") &&
       !originalRequest.url.includes("/auth/logout")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return wholesaleAxios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await wholesaleAxios.post("/auth/refresh", {
          portal: getPortalForAuthContext(authContext),
        });
        const newToken = res.data.accessToken;
        localStorage.setItem(tokenStorageKey, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return wholesaleAxios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem(tokenStorageKey);
        window.dispatchEvent(new Event(getLogoutEventName(authContext)));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default wholesaleAxios;