import ax, { AxiosError, type AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Constant } from "./constant";
import { Links } from "../config/links";

// ===== Extend AxiosRequestConfig to support custom options =====
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  skipAuthRedirect?: boolean; // flag custom
  showToastHasExpired?: boolean;
}

// ===== Get token from cookie =====
const getToken = () => Cookies.get(Constant.ACCESS_TOKEN);

// ===== Create Axios instance =====
const axios = ax.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  // withCredentials: true, // Enable if backend sets httpOnly cookies
});

// ===== Request Interceptor =====
axios.interceptors.request.use(
  (config: any) => {
    const token = getToken();

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Response Interceptor =====
axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const skipRedirect = (error.config as CustomAxiosRequestConfig)
      ?.skipAuthRedirect;
    const showToastHasExpired =
      (error.config as CustomAxiosRequestConfig)?.showToastHasExpired ?? true;

    // === 401: Token expired or invalid ===
    if (status === 401) {
      Cookies.remove(Constant.ACCESS_TOKEN);

      if (showToastHasExpired) {
        toast.error("Your session has expired. Please login again.");
      }

      // Chỉ redirect nếu không bật skipAuthRedirect
      if (!skipRedirect) {
        window.location.href = Links.LOGIN;
      }
    }

    // === 403: No permission ===
    if (status === 403) {
      Cookies.remove(Constant.ACCESS_TOKEN);

      toast.error((error.response?.data as any)?.message || "Access denied");

      // Chỉ redirect nếu không bật skipAuthRedirect
      if (!skipRedirect) {
        window.location.href = Links.LOGIN;
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
