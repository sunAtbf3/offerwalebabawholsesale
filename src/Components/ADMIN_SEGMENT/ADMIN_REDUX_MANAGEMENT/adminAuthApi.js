import { createApi } from '@reduxjs/toolkit/query/react';
import wholesaleAxios, {
  WHOLESALE_ADMIN_ACCESS_TOKEN_KEY,
  AUTH_CONTEXT_ADMIN,
} from '../../../SERVICES/Wholesaleaxios';
import { ROLES } from '../../ADMIN_SEGMENT/roles';

const ADMIN_ROLES = Object.values(ROLES);
const ADMIN_WHOLESALE_PORTAL = 'admin-wholesale';

const axiosBaseQuery = () => async ({ url, method = 'GET', body, params }) => {
  try {
    const result = await wholesaleAxios({
      url,
      method,
      data: body,
      params,
      authContext: AUTH_CONTEXT_ADMIN,
    });
    return { data: result.data };
  } catch (axiosError) {
    return {
      error: {
        status: axiosError.response?.status,
        data: axiosError.response?.data || axiosError.message,
      },
    };
  }
};

export const adminAuthApi = createApi({
  reducerPath: 'adminAuthApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['AdminUser'],
  endpoints: (builder) => ({
    getAdminMe: builder.query({
      query: () => ({ url: '/auth/me' }),
      providesTags: ['AdminUser'],
      transformResponse: (response) => {
        const user = response?.user;
        if (!user?.role || !ADMIN_ROLES.includes(user.role)) {
          throw new Error('insufficient_role');
        }
        return user;
      },
    }),

    adminLogin: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: {
          ...credentials,
          portal: ADMIN_WHOLESALE_PORTAL,
        },
      }),
      transformResponse: (response) => {
        const { accessToken, user } = response;
        if (!user?.role || !ADMIN_ROLES.includes(user.role)) {
          throw new Error('Access denied. Insufficient permissions.');
        }
        if (accessToken) {
          localStorage.setItem(WHOLESALE_ADMIN_ACCESS_TOKEN_KEY, accessToken);
        }
        return user;
      },
      invalidatesTags: ['AdminUser'],
    }),

    adminLogout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
        body: { portal: ADMIN_WHOLESALE_PORTAL },
      }),
      transformResponse: (response) => {
        localStorage.removeItem(WHOLESALE_ADMIN_ACCESS_TOKEN_KEY);
        return response;
      },
      invalidatesTags: ['AdminUser'],
    }),
  }),
});

export const {
  useGetAdminMeQuery,
  useAdminLoginMutation,
  useAdminLogoutMutation,
} = adminAuthApi;
