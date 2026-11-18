import { API_ENDPOINTS } from '@/constants/endpoint.constant';
import { requestApi } from '@/lib/axios';
import type { LoginRequest } from '@/types/auth';
import {
  adminSessionProfileSchema,
  loginResponseSchema,
  logoutResponseSchema,
} from '@/validations/auth.schema';

export const authService = {
  getSession: (signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.ADMIN_SESSION,
        method: 'GET',
        signal,
      },
      adminSessionProfileSchema,
    ),

  login: (payload: LoginRequest, signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.AUTH_LOGIN,
        method: 'POST',
        data: payload,
        signal,
      },
      loginResponseSchema,
    ),

  logout: (signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.AUTH_LOGOUT,
        method: 'POST',
        signal,
      },
      logoutResponseSchema,
    ),
};
