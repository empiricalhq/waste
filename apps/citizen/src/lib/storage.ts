import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import { TOKEN_KEY } from "@/constants";

export const storage = {
  getToken() {
    return getItemAsync(TOKEN_KEY);
  },
  setToken(token: string) {
    return setItemAsync(TOKEN_KEY, token);
  },
  removeToken() {
    return deleteItemAsync(TOKEN_KEY);
  },
};
