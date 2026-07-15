import { createApi } from "@reduxjs/toolkit/query/react";
import wholesaleAxios from "../../../../SERVICES/Wholesaleaxios";

// ─────────────────────────────────────────────────────────────────────────────
// Structured error logger — zero external libs
// ─────────────────────────────────────────────────────────────────────────────
export const logError = (context, error) => {
  console.error(`[wholesalerApi][${context}]`, {
    status: error?.status ?? "UNKNOWN",
    code: error?.data?.code ?? null,
    message: error?.data?.message ?? error?.message ?? "No message",
    errors: error?.data?.errors ?? null,
    timestamp: new Date().toISOString(),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom baseQuery — reuses your existing wholesaleAxios instance
// ─────────────────────────────────────────────────────────────────────────────
const wholesaleAxiosBaseQuery = () =>
  async ({ url, method = "GET", body, params }) => {
    try {
      const config = { url, method, params };

      if (body instanceof FormData) {
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
          data: err.response?.data ?? { message: err.message },
        },
      };
    }
  };

export const wholesalerApi = createApi({
  reducerPath: "wholesalerApi",
  baseQuery: wholesaleAxiosBaseQuery(),
  endpoints: (builder) => ({
    /** Phase 1 — basic interest (name, email, phone, WhatsApp). */
    submitWholesalerRequest: builder.mutation({
      query: (formData) => ({
        url: "/wholesaler/request",
        method: "POST",
        body: formData,
      }),
    }),

    /** Phase 2 — business details + proofs after owner approval. Sends OTP on success. */
    completeWholesalerDetails: builder.mutation({
      query: (formData) => ({
        url: "/wholesaler/complete-details",
        method: "POST",
        body: formData,
      }),
    }),

    /** Public onboarding status by mobile. */
    getWholesalerOnboardingStatus: builder.query({
      query: (mobileNumber) => ({
        url: "/wholesaler/onboarding-status",
        method: "GET",
        params: { mobileNumber },
      }),
    }),

    sendActivationOtp: builder.mutation({
      query: ({ mobileNumber }) => ({
        url: "/wholesaler/activate/send-otp",
        method: "POST",
        body: { mobileNumber },
      }),
    }),

    verifyActivationOtp: builder.mutation({
      query: ({ mobileNumber, otp, password }) => ({
        url: "/wholesaler/activate/verify",
        method: "POST",
        body: { mobileNumber, otp, password },
      }),
    }),
  }),
});

export const {
  useSubmitWholesalerRequestMutation,
  useCompleteWholesalerDetailsMutation,
  useLazyGetWholesalerOnboardingStatusQuery,
  useSendActivationOtpMutation,
  useVerifyActivationOtpMutation,
} = wholesalerApi;
