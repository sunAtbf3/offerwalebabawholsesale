import { createApi } from '@reduxjs/toolkit/query/react';
import wholesaleAxios, { AUTH_CONTEXT_ADMIN } from "../../../../SERVICES/Wholesaleaxios";

/**
 * Axios adapter for RTK Query — matches ecom adminOrdersApi (admin auth + blob support).
 */
const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, method, data, params, headers, responseType }) => {
    try {
      const result = await wholesaleAxios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers: { ...headers },
        authContext: AUTH_CONTEXT_ADMIN,
        ...(responseType ? { responseType } : {}),
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;
      const status = err.response?.status;
      const payload = err.response?.data;
      const message =
        (typeof payload === 'object' && payload?.message) ||
        (typeof payload === 'string' ? payload : null) ||
        err.message;
      return {
        error: {
          status,
          data: payload ?? { message },
          message,
        },
      };
    }
  };

/**
 * @typedef {Object} AdminOrdersSummaryResponse
 * @property {boolean} success
 * @property {Object} data
 */

export const adminOrdersApi = createApi({
  reducerPath: 'adminOrdersApi',
  baseQuery: axiosBaseQuery({ baseUrl: '' }),
  tagTypes: [
    'AdminOrdersSummary',
    'AdminOrdersList',
    'AdminOrderTracking',
    'AdminRtoList',
    'AdminRtoAnalytics',
  ],
  keepUnusedDataFor: 30,
  endpoints: (builder) => ({
    /**
     * Dashboard cards + tab counts (date range).
     * GET /api/admin/orders/summary
     */
    getAdminOrdersSummary: builder.query({
      query: (arg = {}) => {
        const params = {};
        if (arg.from) params.from = arg.from;
        if (arg.to) params.to = arg.to;
        if (arg.rangePreset) params.rangePreset = arg.rangePreset;
        if (arg.presetDays != null && arg.presetDays !== '' && !arg.from && !arg.to && !arg.rangePreset) {
          params.presetDays = arg.presetDays;
        }
        if (arg.preset === '30d') params.preset = '30d';
        return {
          url: '/admin/orders/summary',
          method: 'GET',
          params,
        };
      },
      providesTags: [{ type: 'AdminOrdersSummary', id: 'SUMMARY' }],
    }),

    /**
     * Paginated list with filters.
     * GET /api/admin/orders
     */
    getAdminOrdersList: builder.query({
      query: (arg = {}) => {
        const params = {
          page: arg.page ?? 1,
          limit: arg.limit ?? 20,
          sortBy: arg.sortBy ?? 'createdAt',
          sortOrder: arg.sortOrder ?? 'desc',
        };
        if (arg.from) params.from = arg.from;
        if (arg.to) params.to = arg.to;
        if (arg.rangePreset) params.rangePreset = arg.rangePreset;
        if (arg.presetDays != null && arg.presetDays !== '' && !arg.from && !arg.to && !arg.rangePreset) {
          params.presetDays = arg.presetDays;
        }
        if (arg.preset === '30d') params.preset = '30d';
        if (arg.bucket && arg.bucket !== 'all') params.bucket = arg.bucket;
        if (arg.search && String(arg.search).trim()) params.search = String(arg.search).trim();
        return {
          url: '/admin/orders',
          method: 'GET',
          params,
        };
      },
      providesTags: (result) =>
        result?.data?.orders?.length
          ? [
              ...result.data.orders.map((o) => ({
                type: 'AdminOrdersList',
                id: o.orderId,
              })),
              { type: 'AdminOrdersList', id: 'PARTIAL' },
            ]
          : [{ type: 'AdminOrdersList', id: 'PARTIAL' }],
    }),

    /**
     * Single order (existing user-facing route; admin / order_manager allowed server-side).
     * GET /api/orders/items/:orderId
     */
    getAdminOrderDetail: builder.query({
      query: (orderId) => ({
        url: `/orders/items/${encodeURIComponent(String(orderId))}`,
        method: 'GET',
      }),
      providesTags: (result, error, orderId) => [{ type: 'AdminOrdersList', id: orderId }],
    }),

    // ADDED: Live tracking + timeline sync from provider (was missing in wholesale)
    // GET /api/orders/items/:orderId/track
    getAdminOrderTracking: builder.query({
      query: (orderId) => ({
        url: `/orders/items/${encodeURIComponent(String(orderId))}/track`,
        method: 'GET',
      }),
      providesTags: (result, error, orderId) => [{ type: 'AdminOrderTracking', id: orderId }],
    }),

    // ADDED: Return request list (was missing in wholesale)
    getAdminReturnRequests: builder.query({
      query: (arg = {}) => ({
        url: '/orders/admin/returns/requests',
        method: 'GET',
        params: {
          page: arg.page ?? 1,
          limit: arg.limit ?? 20,
          ...(arg.status ? { status: arg.status } : {}),
        },
      }),
      providesTags: [{ type: 'AdminOrderTracking', id: 'RETURNS_LIST' }],
    }),

    // ADDED: Return request detail (was missing in wholesale)
    getAdminReturnRequestDetail: builder.query({
      query: (orderId) => ({
        url: `/orders/admin/returns/requests/${encodeURIComponent(String(orderId))}`,
        method: 'GET',
      }),
      providesTags: (result, error, orderId) => [{ type: 'AdminOrderTracking', id: `RETURN_${orderId}` }],
    }),

    // ADDED: Approve / reject a return (was missing in wholesale)
    decideAdminReturnRequest: builder.mutation({
      query: ({ orderId, decision, decisionReason }) => ({
        url: `/orders/admin/returns/requests/${encodeURIComponent(String(orderId))}/decision`,
        method: 'POST',
        data: { decision, decisionReason },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'AdminOrderTracking', id: 'RETURNS_LIST' },
        { type: 'AdminOrderTracking', id: `RETURN_${arg.orderId}` },
        { type: 'AdminOrdersList', id: arg.orderId },
      ],
    }),

    // ADDED: Initiate refund for approved return (was missing in wholesale)
    initiateAdminReturnRefund: builder.mutation({
      query: ({ orderId }) => ({
        url: `/orders/admin/returns/requests/${encodeURIComponent(String(orderId))}/refund`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'AdminOrderTracking', id: 'RETURNS_LIST' },
        { type: 'AdminOrderTracking', id: `RETURN_${arg.orderId}` },
        { type: 'AdminOrdersList', id: arg.orderId },
      ],
    }),

    // ADDED: Retry reverse pickup for a return (was missing in wholesale)
    adminReturnReversePickupRetry: builder.mutation({
      query: ({ orderId }) => ({
        url: `/orders/admin/returns/requests/${encodeURIComponent(String(orderId))}/reverse-pickup/retry`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'AdminOrderTracking', id: 'RETURNS_LIST' },
        { type: 'AdminOrderTracking', id: `RETURN_${arg.orderId}` },
        { type: 'AdminOrdersList', id: arg.orderId },
      ],
    }),

    getAdminReturnChat: builder.query({
      query: (orderId) => ({
        url: `/orders/admin/returns/requests/${encodeURIComponent(String(orderId))}/chat`,
        method: 'GET',
      }),
      providesTags: (result, error, orderId) => [
        { type: 'AdminOrderTracking', id: `RETURN_CHAT_${orderId}` },
      ],
      async onQueryStarted(orderId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            adminOrdersApi.util.updateQueryData(
              'getAdminReturnRequestDetail',
              orderId,
              (draft) => {
                if (draft?.order?.returnInfo) {
                  draft.order.returnInfo.adminLastRead = data.adminLastRead;
                  draft.order.returnInfo.userLastRead = data.userLastRead;
                  draft.order.returnInfo.chat = data.chat;
                }
              }
            )
          );
        } catch {
          // Polling errors are surfaced by RTK Query and retried on the next interval.
        }
      },
    }),

    sendAdminReturnChatMessage: builder.mutation({
      query: ({ orderId, message }) => ({
        url: `/orders/admin/returns/requests/${encodeURIComponent(String(orderId))}/chat`,
        method: 'POST',
        data: { message },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'AdminOrderTracking', id: `RETURN_CHAT_${arg.orderId}` },
        { type: 'AdminOrderTracking', id: `RETURN_${arg.orderId}` },
        { type: 'AdminOrdersList', id: arg.orderId },
      ],
    }),

    // ADDED: Create / ensure Shiprocket shipment (was missing in wholesale)
    adminFulfillmentEnsureShipment: builder.mutation({
      query: (orderId) => ({
        url: `/orders/admin/items/${encodeURIComponent(String(orderId))}/fulfillment/ensure-shipment`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: 'AdminOrdersList', id: orderId },
        { type: 'AdminOrderTracking', id: orderId },
      ],
    }),

    // ADDED: Assign courier + generate AWB (was missing in wholesale)
    adminFulfillmentAssignShip: builder.mutation({
      query: ({ orderId, courierId }) => ({
        url: `/orders/admin/items/${encodeURIComponent(String(orderId))}/fulfillment/assign-ship`,
        method: 'POST',
        data: courierId != null ? { courierId } : {},
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'AdminOrdersList', id: arg.orderId },
        { type: 'AdminOrderTracking', id: arg.orderId },
      ],
    }),

    // ADDED: Schedule pickup date (was missing in wholesale)
    adminFulfillmentSchedulePickup: builder.mutation({
      query: ({ orderId, pickupDate }) => ({
        url: `/orders/admin/items/${encodeURIComponent(String(orderId))}/fulfillment/schedule-pickup`,
        method: 'POST',
        data: { pickupDate },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'AdminOrdersList', id: arg.orderId },
        { type: 'AdminOrderTracking', id: arg.orderId },
      ],
    }),

    // ADDED: Bulk confirm pending orders (was missing in wholesale)
    adminBulkApprovalConfirm: builder.mutation({
      query: (arg = {}) => ({
        url: '/orders/admin/items/bulk-approval/confirm',
        method: 'POST',
        data: {
          orderIds: arg.orderIds,
          ...(arg.concurrency != null && arg.concurrency !== '' ? { concurrency: arg.concurrency } : {}),
        },
      }),
      invalidatesTags: (result, error, arg) => {
        if (error) return [];
        const tags = [
          { type: 'AdminOrdersList', id: 'PARTIAL' },
          { type: 'AdminOrdersSummary', id: 'SUMMARY' },
        ];
        const ids = Array.isArray(arg?.orderIds) ? arg.orderIds : [];
        for (const oid of ids) {
          tags.push({ type: 'AdminOrdersList', id: oid }, { type: 'AdminOrderTracking', id: oid });
        }
        return tags;
      },
    }),

    // ADDED: Bulk cancel pending orders (was missing in wholesale)
    adminBulkApprovalCancel: builder.mutation({
      query: (arg = {}) => ({
        url: '/orders/admin/items/bulk-approval/cancel',
        method: 'POST',
        data: {
          orderIds: arg.orderIds,
          ...(arg.concurrency != null && arg.concurrency !== '' ? { concurrency: arg.concurrency } : {}),
        },
      }),
      invalidatesTags: (result, error, arg) => {
        if (error) return [];
        const tags = [
          { type: 'AdminOrdersList', id: 'PARTIAL' },
          { type: 'AdminOrdersSummary', id: 'SUMMARY' },
        ];
        const ids = Array.isArray(arg?.orderIds) ? arg.orderIds : [];
        for (const oid of ids) {
          tags.push({ type: 'AdminOrdersList', id: oid }, { type: 'AdminOrderTracking', id: oid });
        }
        return tags;
      },
    }),

    // ADDED: Bulk ship-now across multiple orders (was missing in wholesale)
    adminBulkFulfillmentShipNow: builder.mutation({
      query: (arg = {}) => ({
        url: '/orders/admin/items/bulk-fulfillment/ship-now',
        method: 'POST',
        data: {
          orderIds: arg.orderIds,
          ...(arg.concurrency != null && arg.concurrency !== '' ? { concurrency: arg.concurrency } : {}),
          ...(arg.courierId != null && arg.courierId !== '' ? { courierId: arg.courierId } : {}),
        },
      }),
      invalidatesTags: (result, error, arg) => {
        if (error) return [];
        const tags = [
          { type: 'AdminOrdersList', id: 'PARTIAL' },
          { type: 'AdminOrdersSummary', id: 'SUMMARY' },
        ];
        const ids = Array.isArray(arg?.orderIds) ? arg.orderIds : [];
        for (const oid of ids) {
          tags.push({ type: 'AdminOrdersList', id: oid }, { type: 'AdminOrderTracking', id: oid });
        }
        return tags;
      },
    }),

    // ADDED: Bulk schedule pickup across multiple orders (was missing in wholesale)
    adminBulkFulfillmentSchedulePickup: builder.mutation({
      query: (arg = {}) => ({
        url: '/orders/admin/items/bulk-fulfillment/schedule-pickup',
        method: 'POST',
        data: {
          orderIds: arg.orderIds,
          pickupDate: arg.pickupDate,
          ...(arg.concurrency != null && arg.concurrency !== '' ? { concurrency: arg.concurrency } : {}),
        },
      }),
      invalidatesTags: (result, error, arg) => {
        if (error) return [];
        const tags = [
          { type: 'AdminOrdersList', id: 'PARTIAL' },
          { type: 'AdminOrdersSummary', id: 'SUMMARY' },
        ];
        const ids = Array.isArray(arg?.orderIds) ? arg.orderIds : [];
        for (const oid of ids) {
          tags.push({ type: 'AdminOrdersList', id: oid }, { type: 'AdminOrderTracking', id: oid });
        }
        return tags;
      },
    }),

    // ADDED: Get / generate shipping label URL (was missing in wholesale)
    adminFulfillmentShippingLabel: builder.mutation({
      query: (orderId) => ({
        url: `/orders/admin/items/${encodeURIComponent(String(orderId))}/fulfillment/shipping-label`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: 'AdminOrdersList', id: orderId },
        { type: 'AdminOrderTracking', id: orderId },
      ],
    }),

    // ADDED: Cancel shipment on Shiprocket (was missing in wholesale)
    adminFulfillmentCancelShipment: builder.mutation({
      query: (orderId) => ({
        url: `/orders/admin/items/${encodeURIComponent(String(orderId))}/fulfillment/cancel-shipment`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: 'AdminOrdersList', id: orderId },
        { type: 'AdminOrderTracking', id: orderId },
      ],
    }),

    // ── RTO (ecom parity) ────────────────────────────────────────────────────
    getAdminRtoOrders: builder.query({
      query: (params = {}) => ({
        url: '/admin/rto/orders',
        method: 'GET',
        params,
      }),
      providesTags: (result) => {
        const tags = [
          { type: 'AdminRtoList', id: 'LIST' },
          { type: 'AdminRtoAnalytics', id: 'SUMMARY' },
        ];
        const orders = result?.data?.orders;
        if (Array.isArray(orders)) {
          for (const o of orders) {
            if (o?.orderId) tags.push({ type: 'AdminRtoList', id: o.orderId });
          }
        }
        return tags;
      },
    }),

    getAdminRtoAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/admin/rto/analytics',
        method: 'GET',
        params,
      }),
      providesTags: [{ type: 'AdminRtoAnalytics', id: 'SUMMARY' }],
    }),

    adminAutoSyncRtoStatuses: builder.mutation({
      query: (arg = {}) => {
        const params = {};
        if (arg.from) params.from = arg.from;
        if (arg.to) params.to = arg.to;
        if (arg.rangePreset) params.rangePreset = arg.rangePreset;
        if (arg.presetDays != null && arg.presetDays !== '' && !arg.from && !arg.to && !arg.rangePreset) {
          params.presetDays = arg.presetDays;
        }
        if (arg.preset === '30d') params.preset = '30d';
        if (arg.staleMinutes != null) params.staleMinutes = arg.staleMinutes;
        if (arg.maxRunMs != null) params.maxRunMs = arg.maxRunMs;
        return {
          url: '/admin/rto/auto-sync-statuses',
          method: 'POST',
          params,
        };
      },
      invalidatesTags: (result, error) => {
        if (error) return [];
        const updated = result?.data?.summary?.updated ?? 0;
        const synced = result?.data?.summary?.synced ?? 0;
        if (updated <= 0 && synced <= 0) return [];
        return [
          { type: 'AdminRtoList', id: 'LIST' },
          { type: 'AdminRtoAnalytics', id: 'SUMMARY' },
        ];
      },
    }),

    exportAdminRtoReport: builder.query({
      query: (params = {}) => ({
        url: '/admin/rto/report',
        method: 'GET',
        params,
        responseType: 'blob',
      }),
    }),

    adminRtoRefund: builder.mutation({
      query: (body) => ({
        url: '/admin/rto/refund',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: (result, error, arg) => {
        if (error) return [];
        const id = arg?.orderId;
        return [
          { type: 'AdminRtoList', id: 'LIST' },
          { type: 'AdminRtoAnalytics', id: 'SUMMARY' },
          ...(id ? [{ type: 'AdminRtoList', id: String(id) }] : []),
        ];
      },
    }),

    adminRtoReject: builder.mutation({
      query: (body) => ({
        url: '/admin/rto/reject',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: (result, error, arg) => {
        if (error) return [];
        const id = arg?.orderId;
        return [
          { type: 'AdminRtoList', id: 'LIST' },
          { type: 'AdminRtoAnalytics', id: 'SUMMARY' },
          ...(id ? [{ type: 'AdminRtoList', id: String(id) }] : []),
        ];
      },
    }),

    /** @deprecated use adminRtoReject */
    adminRtoResolve: builder.mutation({
      query: (body) => ({
        url: '/admin/rto/reject',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: (result, error, arg) => {
        if (error) return [];
        const id = arg?.orderId;
        return [
          { type: 'AdminRtoList', id: 'LIST' },
          { type: 'AdminRtoAnalytics', id: 'SUMMARY' },
          ...(id ? [{ type: 'AdminRtoList', id: String(id) }] : []),
        ];
      },
    }),

    adminRtoBulkAction: builder.mutation({
      query: (body) => ({
        url: '/admin/rto/bulk-action',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: (result, error) => {
        if (error) return [];
        return [
          { type: 'AdminRtoList', id: 'LIST' },
          { type: 'AdminRtoAnalytics', id: 'SUMMARY' },
        ];
      },
    }),
  }),
});

export const {
  useGetAdminOrdersSummaryQuery,
  useGetAdminOrdersListQuery,
  useGetAdminOrderDetailQuery,
  useLazyGetAdminOrderDetailQuery,
  // ADDED exports:
  useGetAdminOrderTrackingQuery,
  useGetAdminReturnRequestsQuery,
  useGetAdminReturnRequestDetailQuery,
  useDecideAdminReturnRequestMutation,
  useInitiateAdminReturnRefundMutation,
  useAdminReturnReversePickupRetryMutation,
  useGetAdminReturnChatQuery,
  useSendAdminReturnChatMessageMutation,
  useAdminFulfillmentEnsureShipmentMutation,
  useAdminFulfillmentAssignShipMutation,
  useAdminFulfillmentSchedulePickupMutation,
  useAdminFulfillmentShippingLabelMutation,
  useAdminFulfillmentCancelShipmentMutation,
  useAdminBulkApprovalConfirmMutation,
  useAdminBulkApprovalCancelMutation,
  useAdminBulkFulfillmentShipNowMutation,
  useAdminBulkFulfillmentSchedulePickupMutation,
  useGetAdminRtoOrdersQuery,
  useGetAdminRtoAnalyticsQuery,
  useLazyExportAdminRtoReportQuery,
  useAdminAutoSyncRtoStatusesMutation,
  useAdminRtoRefundMutation,
  useAdminRtoRejectMutation,
  useAdminRtoResolveMutation,
  useAdminRtoBulkActionMutation,
} = adminOrdersApi;