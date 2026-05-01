// // REDUX_SLICES/authSlice.js
// REDUX_SLICES/authApi/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { authApi } from './authApi';

const logError = (context, error) => {
  console.error(`[authSlice][${context}]`, {
    message: error?.message || 'Unknown error',
    timestamp: new Date().toISOString(),
  });
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set authenticated session from non-login flows (e.g. account activation)
    setAuthenticatedSession: (state, action) => {
      const user = action.payload?.user || null;
      const accessToken = action.payload?.accessToken || null;

      state.user = user;
      state.isAuthenticated = Boolean(user || accessToken);
      state.loading = false;
      state.error = null;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
    },
    // Manual logout (clear state)
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      // state.defaultAddress = null;
      localStorage.removeItem('accessToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {

    // ── login ──────────────────────────────────────────────────────────────
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = payload.user;
        state.error = null;
        if (payload.accessToken) {
          localStorage.setItem('accessToken', payload.accessToken);
        }
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, { error }) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = error?.data?.message || 'Login failed';
        logError('login.rejected', error);
      });

    // ── getMe ──────────────────────────────────────────────────────────────
    builder
      .addMatcher(authApi.endpoints.getMe.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = payload.user || payload;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.getMe.matchRejected, (state, { error }) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        if (error?.status !== 401) {
          state.error = error?.data?.message || 'Failed to fetch user';
        }
        logError('getMe.rejected', error);
      });

    // ── logout ─────────────────────────────────────────────────────────────
    builder
      .addMatcher(authApi.endpoints.logout.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        localStorage.removeItem('accessToken');
      })
      .addMatcher(authApi.endpoints.logout.matchRejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        localStorage.removeItem('accessToken');
        logError('logout.rejected', { message: 'Logout failed but state cleared' });
      });

    // ── updateProfile ──────────────────────────────────────────────────────
    // This handles the updateProfile thunk defined inside UserProfile.jsx.
    // It merges the returned user fields into state so the navbar/dashboard
    // immediately reflect the new name without a page refresh.
    builder
      .addMatcher(
        (action) => action.type === 'auth/updateProfile/fulfilled',
        (state, { payload }) => {
          if (payload?.user) {
            // Merge — don't replace — so fields not returned (e.g. role) are kept
            state.user = { ...state.user, ...payload.user };
          }
        }
      )
      .addMatcher(
        (action) => action.type === 'auth/updateProfile/rejected',
        (state, { error }) => {
          logError('updateProfile.rejected', error);
        }
      );
  },
});

export const { setAuthenticatedSession, logout, clearError, setLoading } = authSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectUser            = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading     = (state) => state.auth.loading;
export const selectAuthError       = (state) => state.auth.error;   // ← was missing

export default authSlice.reducer;
// import { createSlice } from '@reduxjs/toolkit';
// import { authApi } from './authApi';

// const logError = (context, error) => {
//   console.error(`[authSlice][${context}]`, {
//     message: error?.message || 'Unknown error',
//     timestamp: new Date().toISOString(),
//   });
// };

// const initialState = {
//   user: null,
//   isAuthenticated: false,
//   loading: false,
//   error: null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     // Manual logout (clear state)
//     logout: (state) => {
//       state.user = null;
//       state.isAuthenticated = false;
//       state.loading = false;
//       state.error = null;
//       localStorage.removeItem('accessToken');
//     },
//     // Clear error
//     clearError: (state) => {
//       state.error = null;
//     },
//     // Set loading
//     setLoading: (state, action) => {
//       state.loading = action.payload;
//     },
//   },
//   extraReducers: (builder) => {
//     // Handle login mutation
//     builder
//       .addMatcher(authApi.endpoints.login.matchPending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
//         state.loading = false;
//         state.isAuthenticated = true;
//         state.user = payload.user;
//         state.error = null;
//         // Store token in localStorage
//         if (payload.accessToken) {
//           localStorage.setItem('accessToken', payload.accessToken);
//         }
//       })
//       .addMatcher(authApi.endpoints.login.matchRejected, (state, { error }) => {
//         state.loading = false;
//         state.isAuthenticated = false;
//         state.user = null;
//         state.error = error?.data?.message || 'Login failed';
//         logError('login.rejected', error);
//       });

//     // Handle getMe query
//     builder
//       .addMatcher(authApi.endpoints.getMe.matchPending, (state) => {
//         state.loading = true;
//       })
//       .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, { payload }) => {
//         state.loading = false;
//         state.isAuthenticated = true;
//         state.user = payload.user || payload;
//         state.error = null;
//       })
//       .addMatcher(authApi.endpoints.getMe.matchRejected, (state, { error }) => {
//         state.loading = false;
//         state.isAuthenticated = false;
//         state.user = null;
//         // Don't set error on 401 - just not authenticated
//         if (error?.status !== 401) {
//           state.error = error?.data?.message || 'Failed to fetch user';
//         }
//         logError('getMe.rejected', error);
//       });

//     // Handle logout mutation
//     builder
//       .addMatcher(authApi.endpoints.logout.matchPending, (state) => {
//         state.loading = true;
//       })
//       .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
//         state.user = null;
//         state.isAuthenticated = false;
//         state.loading = false;
//         state.error = null;
//         localStorage.removeItem('accessToken');
//       })
//       .addMatcher(authApi.endpoints.logout.matchRejected, (state) => {
//         state.user = null;
//         state.isAuthenticated = false;
//         state.loading = false;
//         localStorage.removeItem('accessToken');
//         logError('logout.rejected', { message: 'Logout failed but state cleared' });
//       });
//   },
// });

// export const { logout, clearError, setLoading } = authSlice.actions;

// // Selectors
// export const selectUser = (state) => state.auth.user;
// export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
// export const selectAuthLoading = (state) => state.auth.loading;
// export const selectAuthError = (state) => state.auth.error;

// export default authSlice.reducer;