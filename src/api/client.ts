import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

function processQueue(token: string | null, error: unknown = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
}

function getAccessToken(): string | null {
  try {
    return localStorage.getItem("access_token");
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  try {
    return localStorage.getItem("refresh_token");
  } catch {
    return null;
  }
}

function setTokens(accessToken: string, refreshToken?: string): void {
  try {
    localStorage.setItem("access_token", accessToken);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
  } catch {
    // localStorage unavailable
  }
}

function clearTokens(): void {
  try {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  } catch {
    // localStorage unavailable
  }
}

export { setTokens, clearTokens, getAccessToken, getRefreshToken };

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Don't retry auth endpoints themselves
    const isAuthEndpoint =
      typeof originalRequest.url === "string" &&
      originalRequest.url.startsWith("/auth/");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshTokenValue = getRefreshToken();
        if (!refreshTokenValue) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshTokenValue,
        });

        const { token, refresh_token: newRefreshToken } = response.data;
        setTokens(token, newRefreshToken || refreshTokenValue);
        processQueue(token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(null, refreshError);
        clearTokens();
        // Redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Retry wrapper for transient failures
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const axiosError = error as AxiosError;
      const isNetworkError = !axiosError.response && axiosError.code !== "ECONNABORTED";
      const isServerError = axiosError.response && axiosError.response.status >= 500;
      const isTimeout = axiosError.code === "ECONNABORTED";

      if (isNetworkError || isServerError || isTimeout) {
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
          continue;
        }
      }

      // Non-retryable error (4xx) or exhausted retries
      break;
    }
  }

  throw lastError;
}

// Extract error message from API error response
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: { message?: string } }
      | undefined;
    if (data?.error?.message) {
      return data.error.message;
    }
    if (error.response?.status === 401) {
      return "Unauthorized. Please login again.";
    }
    if (error.response?.status === 403) {
      return "You don't have permission to do that.";
    }
    if (error.response?.status === 404) {
      return "Resource not found.";
    }
    if (error.response?.status === 429) {
      return "Too many requests. Please wait.";
    }
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    if (!error.response) {
      return "Network error. Check your connection.";
    }
    return error.message || "An unexpected error occurred.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
}

// Show error toast
export function showApiError(error: unknown): void {
  const message = getErrorMessage(error);
  toast.error(message);
}

export default apiClient;
