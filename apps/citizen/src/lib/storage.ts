import { getItemAsync, setItemAsync, deleteItemAsync } from "expo-secure-store";
import { TOKEN_KEY } from "@/constants";

export const storage = {
  async getToken() {
    return getItemAsync(TOKEN_KEY);
  },
  async setToken(token: string) {
    return setItemAsync(TOKEN_KEY, token);
  },
  async removeToken() {
    return deleteItemAsync(TOKEN_KEY);
  },
};
