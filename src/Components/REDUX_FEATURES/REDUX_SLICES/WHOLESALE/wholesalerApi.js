import { createApi } from "@reduxjs/toolkit/query/react";
import wholesaleAxios from "../../../../SERVICES/Wholesaleaxios";

// ─────────────────────────────────────────────────────────────────────────────
// Structured error logger — zero external libs
// Usage: logError("submitWholesalerRequest", error)
// ─────────────────────────────────────────────────────────────────────────────
export const logError = (context, error) => {
  console.error(`[wholesalerApi][${context}]`, {
    status:    error?.status  ?? "UNKNOWN",
    message:   error?.data?.message ?? error?.message ?? "No message",
    errors:    error?.data?.errors  ?? null,
    timestamp: new Date().toISOString(),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom baseQuery — reuses your existing wholesaleAxios instance
// Handles both JSON and multipart/form-data transparently
// ─────────────────────────────────────────────────────────────────────────────
const wholesaleAxiosBaseQuery = () =>
  async ({ url, method = "GET", body, params }) => {
    try {
      const config = { url, method, params };

      if (body instanceof FormData) {
        // Do NOT manually set Content-Type — axios sets multipart + boundary automatically
        config.data = body;
        config.headers = { "Content-Type": "multipart/form-data" };
      } else if (body) {
        config.data = body;
      }

      const result = await wholesaleAxios(config);
      return { data: result.data };
    } catch (err) {
      return {
        error: {
          status: err.response?.status ?? "FETCH_ERROR",
          data:   err.response?.data   ?? { message: err.message },
        },
      };
    }
  };

// ─────────────────────────────────────────────────────────────────────────────
// API slice
// ─────────────────────────────────────────────────────────────────────────────
export const wholesalerApi = createApi({
  reducerPath: "wholesalerApi",
  baseQuery:   wholesaleAxiosBaseQuery(),
  endpoints:   (builder) => ({

    // Journey 1 — Registration
    // FormData: text fields + idProof (file) + businessAddressProof (file)
    submitWholesalerRequest: builder.mutation({
      query: (formData) => ({
        url:    "/wholesaler/request",
        method: "POST",
        body:   formData,
      }),
    }),

    // Journey 3 — Phase 1
    sendActivationOtp: builder.mutation({
      query: ({ mobileNumber }) => ({
        url:    "/wholesaler/activate/send-otp",
        method: "POST",
        body:   { mobileNumber },
      }),
    }),

    // Journey 3 — Phase 2
    verifyActivationOtp: builder.mutation({
      query: ({ mobileNumber, otp, password }) => ({
        url:    "/wholesaler/activate/verify",
        method: "POST",
        body:   { mobileNumber, otp, password },
      }),
    }),
  }),
});

export const {
  useSubmitWholesalerRequestMutation,
  useSendActivationOtpMutation,
  useVerifyActivationOtpMutation,
} = wholesalerApi;