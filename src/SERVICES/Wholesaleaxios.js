import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// Wholesale Axios Instance
// Every request automatically carries `X-Store-Type: wholesale` so the backend
// knows to respond with wholesale pricing (MOQ, bulk tiers, etc.)
// ─────────────────────────────────────────────────────────────────────────────

const wholesaleAxios = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8081/api",
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
    const token = localStorage.getItem("accessToken");
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

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/login")
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
        const res = await wholesaleAxios.post("/auth/refresh");
        const newToken = res.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return wholesaleAxios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default wholesaleAxios;