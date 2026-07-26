import apiClient, { withRetry, showApiError } from "./client";
import type { AuthUser, LoginRequest, SignupRequest, OtpRequest, OtpVerifyRequest, ForgotPasswordRequest, ResetPasswordRequest } from "../types";
import type { RawUser, RawAuthResponse } from "../types/api";
import { transformUser } from "./transformers";
import { setTokens, clearTokens } from "./client";

export async function login(data: LoginRequest): Promise<AuthUser> {
  const payload: Record<string, string> = {};
  if (data.email) payload.email = data.email;
  if (data.username) payload.username = data.username;
  if (data.phone) payload.phone = data.phone;
  payload.password = data.password;
  const response = await withRetry(() =>
    apiClient.post<RawAuthResponse>("/auth/login", payload),
  );
  const { user: rawUser, token, refresh_token } = response.data;
  setTokens(token, refresh_token);
  return transformUser(rawUser);
}

export async function signup(data: SignupRequest): Promise<AuthUser> {
  const payload = {
    username: data.username,
    display_name: data.displayName,
    password: data.password,
    email: data.email,
    phone: data.phone,
    locale: data.locale || "bn",
  };
  const response = await withRetry(() =>
    apiClient.post<RawAuthResponse>("/auth/signup", payload),
  );
  const { user: rawUser, token, refresh_token } = response.data;
  setTokens(token, refresh_token);
  return transformUser(rawUser);
}

export async function sendOtp(data: OtpRequest): Promise<void> {
  await withRetry(() => apiClient.post("/auth/otp/send", data));
}

export async function verifyOtp(data: OtpVerifyRequest): Promise<string> {
  const response = await withRetry(() =>
    apiClient.post<{ token: string }>("/auth/otp/verify", data),
  );
  const { token } = response.data;
  setTokens(token);
  return token;
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
  await withRetry(() => apiClient.post("/auth/forgot-password", data));
}

export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  await withRetry(() => apiClient.post("/auth/reset-password", data));
}

export async function getMe(): Promise<AuthUser> {
  const response = await withRetry(() =>
    apiClient.get<{ user: RawUser }>("/auth/me"),
  );
  return transformUser(response.data.user);
}

export async function updateProfile(data: Partial<{ display_name: string; bio: string; avatar_url: string }>): Promise<AuthUser> {
  const response = await withRetry(() =>
    apiClient.patch<{ user: RawUser }>("/auth/profile", data),
  );
  return transformUser(response.data.user);
}

export function logout(): void {
  clearTokens();
  try {
    apiClient.post("/auth/logout").catch(() => {});
  } catch {
    // Ignore logout API errors
  }
}

export function handleAuthError(error: unknown): string {
  showApiError(error);
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
    return axiosError.response?.data?.error?.message || "Authentication failed";
  }
  return "Authentication failed";
}
