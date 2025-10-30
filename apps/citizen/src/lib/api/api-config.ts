import { APP_CONFIG } from "@/constants/app-config";
import { getToken } from "@/lib/storage/secure-storage";

export const getApiConfig = async () => {
  const token = await getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return {
    baseURL: APP_CONFIG.API_URL,
    timeout: APP_CONFIG.API_TIMEOUT,
    headers,
  };
};
