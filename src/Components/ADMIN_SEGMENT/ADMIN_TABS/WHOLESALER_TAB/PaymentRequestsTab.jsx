import React, { useState } from "react";
import { useGetWholesalerRequestsQuery } from "../../ADMIN_REDUX_MANAGEMENT/wholesalerApi/wholesalerApi";
import RequestDetailModal from "./RequestDetailModal";

const PAYMENT_FILTERS = [
  { id: "", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "created", label: "Created" },
  { id: "paid", label: "Paid" },
  { id: "failed", label: "Failed" },
];

const badgeCls = {
  not_required: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-800",
  created: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function PaymentRequestsTab({ onRequestAction }) {
  const [page, setPage] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useGetWholesalerRequestsQuery({
    status: "",
    paymentStatus,
    page,
    limit: 10,
  });

  const requests = data?.requests || [];
  const totalPages = data?.pagination?.totalPages || 1;

  if (isLoading) {
    return <div className="flex justify-center items-center h-48"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }
  if (isError) {
    return <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">{error?.data?.message || "Failed to load payments."}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Payment status</label>
        <select
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {PAYMENT_FILTERS.map((item) => (
            <option key={item.id || "all"} value={item.id}>{item.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => {
                const status = String(request.registrationPaymentStatus || "pending").toLowerCase();
                return (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{request.fullName}</div>
                      <div className="text-xs text-gray-500">{request.email || "—"}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{request.mobileNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Rs. {Number(request.registrationFeeAmount || 1200).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeCls[status] || badgeCls.pending}`}>
                        {status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {request.registrationPaidAt ? new Date(request.registrationPaidAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <p className="text-sm text-gray-700">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 border rounded-md text-sm disabled:opacity-50">Previous</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-2 border rounded-md text-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      <RequestDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
          refetch();
          onRequestAction?.();
        }}
        request={selectedRequest}
        onRequestAction={onRequestAction}
      />
    </div>
  );
}
