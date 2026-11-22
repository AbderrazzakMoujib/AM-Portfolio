
import axios from "axios";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000",
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
  },
});

export async function initializeCsrf() {
  await api.get("/sanctum/csrf-cookie");
}

export async function login(
  email: string,
  password: string
) {
  await initializeCsrf();

  await api.post("/login", {
    email,
    password,
  });

  return getCurrentUser();
}

export async function getCurrentUser(): Promise<AdminUser | null> {
  try {
    const response = await api.get<{ user: AdminUser }>(
      "/auth/me"
    );

    return response.data.user;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      return null;
    }

    throw error;
  }
}

export async function logout() {
  await api.post("/logout");
}
