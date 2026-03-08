import axios from "axios";
import { API_BASE } from "./constants";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status !== 401 || original._retry) return Promise.reject(err);

    const refreshToken = localStorage.getItem("pm_refresh_token");
    if (!refreshToken) return Promise.reject(err);

    original._retry = true;
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken });
      localStorage.setItem("pm_token", data.token);
      localStorage.setItem("pm_refresh_token", data.refreshToken);
      original.headers.Authorization = `Bearer ${data.token}`;
      return api(original);
    } catch {
      return Promise.reject(err);
    }
  }
);

export default api;
