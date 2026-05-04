import { createSlice } from '@reduxjs/toolkit';
import { adminAuthApi } from './adminAuthApi';
import { ROLES } from '../roles';
import { WHOLESALE_ADMIN_ACCESS_TOKEN_KEY } from '../../../SERVICES/wholesaleAxios';

const VALID_ROLES = Object.values(ROLES);

const decodeJWT = (token) => {
  try {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

const deriveInitialState = () => {
  const token = localStorage.getItem(WHOLESALE_ADMIN_ACCESS_TOKEN_KEY);
  if (!token) {
    return { user: null, status: 'unauthenticated' };
  }

  const payload = decodeJWT(token);
  if (payload && VALID_ROLES.includes(payload.role)) {
    return { user: { role: payload.role, ...payload }, status: 'authenticated' };
  }

  return { user: null, status: 'idle' };
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState: deriveInitialState(),
  reducers: {
    adminForceLogout: (state) => {
      state.user = null;
      state.status = 'unauthenticated';
      localStorage.removeItem(WHOLESALE_ADMIN_ACCESS_TOKEN_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(adminAuthApi.endpoints.adminLogin.matchPending, (state) => {
        state.status = 'loading';
      })
      .addMatcher(adminAuthApi.endpoints.adminLogin.matchFulfilled, (state, { payload }) => {
        if (payload && VALID_ROLES.includes(payload.role)) {
          state.user = payload;
          state.status = 'authenticated';
        } else {
          state.user = null;
          state.status = 'unauthenticated';
        }
      })
      .addMatcher(adminAuthApi.endpoints.adminLogin.matchRejected, (state) => {
        state.user = null;
        state.status = 'unauthenticated';
      })
      .addMatcher(adminAuthApi.endpoints.getAdminMe.matchPending, (state) => {
        if (state.status === 'idle') state.status = 'loading';
      })
      .addMatcher(adminAuthApi.endpoints.getAdminMe.matchFulfilled, (state, { payload }) => {
        if (payload && VALID_ROLES.includes(payload.role)) {
          state.user = payload;
          state.status = 'authenticated';
        } else {
          state.user = null;
          state.status = 'unauthenticated';
          localStorage.removeItem(WHOLESALE_ADMIN_ACCESS_TOKEN_KEY);
        }
      })
      .addMatcher(adminAuthApi.endpoints.getAdminMe.matchRejected, (state) => {
        state.user = null;
        state.status = 'unauthenticated';
        localStorage.removeItem(WHOLESALE_ADMIN_ACCESS_TOKEN_KEY);
      })
      .addMatcher(adminAuthApi.endpoints.adminLogout.matchFulfilled, (state) => {
        state.user = null;
        state.status = 'unauthenticated';
      })
      .addMatcher(adminAuthApi.endpoints.adminLogout.matchRejected, (state) => {
        state.user = null;
        state.status = 'unauthenticated';
        localStorage.removeItem(WHOLESALE_ADMIN_ACCESS_TOKEN_KEY);
      });
  },
});

export const { adminForceLogout } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;

export const selectAdminUser = (state) => state.adminAuth.user;
export const selectAdminStatus = (state) => state.adminAuth.status;
export const selectIsAdminAuth = (state) => state.adminAuth.status === 'authenticated';
