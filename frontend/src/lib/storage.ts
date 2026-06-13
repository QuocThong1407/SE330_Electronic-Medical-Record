const TOKEN_KEY = "emr_access_token";
const SESSION_TOKEN_KEY = "emr_session_access_token";

export const storage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(SESSION_TOKEN_KEY);
  },
  setToken(token: string, remember = true) {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      return;
    }

    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  },
};
