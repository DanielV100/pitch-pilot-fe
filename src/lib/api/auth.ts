import { request } from "./core";

export async function login(identifier: string, password: string) {
  const body = {
    username: identifier.includes("@") ? null : identifier,
    email: identifier.includes("@") ? identifier : null,
    password,
  };

  return request<{ access_token: string; token_type: "bearer" }>(
    "/v1/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    }
  );
}

export async function signup(
  username: string,
  email: string,
  password: string
) {
  return request<void>("/v1/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username, email, password }),
  });
}

export async function verifyEmail(token: string) {
  return request<void>(`/v1/auth/verify?token=${token}`);
}

// Resend verification link  (needs BE support)
export async function resendVerification(email: string) {
  return request<void>("/v1/auth/resend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}
