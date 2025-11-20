import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://recruit.paysbypays.com/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api;