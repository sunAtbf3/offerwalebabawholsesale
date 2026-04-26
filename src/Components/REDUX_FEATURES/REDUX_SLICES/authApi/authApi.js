// REDUX_SLICES/authApi.js
import { createApi } from '@reduxjs/toolkit/query/react';
// import axiosInstance from '../../SERVICES/axiosInstance';
import wholesaleAxios from "../../../../SERVICES/wholesaleAxios";

const logError = (context, error) => {
  console.error(`[authApi][${context}]`, {
    status: error?.response?.status ?? 'UNKNOWN',
    message: error?.response?.data?.message ?? error?.message ?? 'No message',
    url: error?.config?.url ?? null,
    timestamp: new Date().toISOString(),
  });
};

const baseQuery = async ({ url, method, body, params }) => {
  try {
    const response = await wholesaleAxios({
      url,
      method: method || 'GET',
      data: body,
      params,
    });
    return { data: response.data };
  } catch (error) {
    logError(`${method || 'GET'} ${url}`, error);
    return {
      error: {
        status: error?.response?.status ?? 'FETCH_ERROR',
        data: error?.response?.data ?? { message: error?.message || 'Network error' },
      },
    };
  }
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Login - accepts identifier (email or phone) and password
    login: builder.mutation({
      query: ({ identifier, password }) => ({
        url: '/auth/login',
        method: 'POST',
        body: { identifier, password },
      }),
      invalidatesTags: ['User'],
    }),

    // Logout
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // Get current user profile
    getMe: builder.query({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    // Refresh access token
    refreshToken: builder.mutation({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),

    // Forgot password - request OTP
    forgotPasswordRequestOTP: builder.mutation({
      query: ({ identifier }) => ({
        url: '/auth/forgot-password/request-otp',
        method: 'POST',
        body: { identifier },
      }),
    }),

    // Forgot password - verify OTP
    forgotPasswordVerifyOTP: builder.mutation({
      query: ({ identifier, otp }) => ({
        url: '/auth/forgot-password/verify-otp',
        method: 'POST',
        body: { identifier, otp },
      }),
    }),

    // Forgot password - reset password
    forgotPasswordReset: builder.mutation({
      query: ({ identifier, otp, newPassword }) => ({
        url: '/auth/forgot-password/reset',
        method: 'POST',
        body: { identifier, otp, newPassword },
      }),
    }),

    // Change password (authenticated)
    changePassword: builder.mutation({
      query: ({ oldPassword, newPassword }) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body: { oldPassword, newPassword },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useRefreshTokenMutation,
  useForgotPasswordRequestOTPMutation,
  useForgotPasswordVerifyOTPMutation,
  useForgotPasswordResetMutation,
  useChangePasswordMutation,
} = authApi;