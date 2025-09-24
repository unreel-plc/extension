/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useAuthStore } from "@/stores/auth-store";
import { useAuthStore } from "@/stores/auth-store";
import axios, { type AxiosRequestConfig } from "axios";
import { toast } from "sonner";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, // send/receive cookies for cookie-based auth
});

// Add request interceptor to include bearer token
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = "An unexpected error occurred";

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 400:
          errorMessage = data?.message || "Bad request";
          break;
        case 401:
          errorMessage = "Unauthorized access";
          // Optionally clear auth token and redirect to login
          break;
        case 403:
          errorMessage = "Access forbidden";
          break;
        case 404:
          errorMessage = "Resource not found";
          break;
        case 422:
          errorMessage = data?.message || "Validation error";
          break;
        case 500:
          errorMessage = "Internal server error";
          if (navigateCallback) {
            navigateCallback("/server-error");
          }
          break;
        default:
          errorMessage = data?.message || `Error ${status}`;
      }
    } else if (error.request) {
      // Network error
      errorMessage = "Network error. Please check your connection.";
    }

    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

// Add a navigation callback
let navigateCallback: ((path: string) => void) | null = null;

export const setNavigateCallback = (callback: (path: string) => void) => {
  navigateCallback = callback;
};

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
  status?: number;
}

// API error type
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export default class ApiClient {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async get<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
    return await axiosInstance
      .get(this.endpoint + url, config)
      .then((res) => res.data);
  }

  async post<T = any, D = any>(
    url: string,
    data?: D,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return await axiosInstance
      .post(this.endpoint + url, data, config)
      .then((res) => res);
  }

  async put<T = any, D = any>(
    url: string,
    data?: D,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return await axiosInstance
      .put(this.endpoint + url, data, config)
      .then((res) => res.data);
  }

  /**
   * PATCH request
   */
  async patch<T = any, D = any>(
    url: string,
    data?: D,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return await axiosInstance
      .patch(this.endpoint + url, data, config)
      .then((res) => res.data);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return await axiosInstance
      .delete(this.endpoint + url, config)
      .then((res) => res.data);
  }
}
