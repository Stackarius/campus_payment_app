'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "react-toastify"

export default function PaymentHistory() {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({}) // optional combined pagination

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            setLoading(true)
            try {
                // Get user session for authorization
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    toast.error("You must be logged in to view payments")
                    setLoading(false)
                    return
                }

                // Fetch student payments
                const studentRes = await fetch(`/api/student/payment?page=${page}&limit=10`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                })
                if (!studentRes.ok) throw new Error("Failed to fetch student payments")
                const studentData = await studentRes.json()

                // Fetch merchant payments
                const merchantRes = await fetch(`/api/payment/fetch_payment?page=${page}&limit=10`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                })
                if (!merchantRes.ok) throw new Error("Failed to fetch merchant payments")
                const merchantData = await merchantRes.json()

                // Normalize and combine
                const studentPayments = (studentData.payments || []).map(p => ({
                    id: p.id,
                    reference: p.reference,
                    amount: p.amount,
                    target: "Student",
                    type: p.type,
                    created_at: p.created_at,
                    details: p.student_id,
                }))

                const merchantPayments = (merchantData.payments || []).map(p => ({
                    id: p.id,
                    reference: p.reference,
                    amount: p.amount,
                    target: "Merchant",
                    type: p.payment_type || "Merchant Payment",
                    created_at: p.created_at,
                    details: p.merchant_id,
                }))

                // Combine & sort by date descending
                const combined = [...studentPayments, ...merchantPayments].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                )

                setPayments(combined)
                // Optional combined pagination: take max of both
                setPagination({
                    page: page,
                    totalPages: Math.max(studentData.pagination?.totalPages || 1, merchantData.pagination?.totalPages || 1)
                })

            } catch (err) {
                console.error("Error fetching payment history:", err)
                toast.error("Error fetching payment history")
            } finally {
                setLoading(false)
            }
        }

        fetchPaymentHistory()
    }, [page])

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Payment History</h1>

            <table className="w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border">#</th>
                        <th className="p-2 border">Target</th>
                        <th className="p-2 border">Reference / ID</th>
                        <th className="p-2 border">Amount</th>
                        <th className="p-2 border">Type</th>
                        <th className="p-2 border">Details</th>
                        <th className="p-2 border">Date</th>
                    </tr>
                </thead>
                <tbody className="text-center">
                    {loading ? (
                        <tr>
                            <td colSpan="7" className="p-4">Loading...</td>
                        </tr>
                    ) : payments.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="p-4">No payments found</td>
                        </tr>
                    ) : (
                        payments.map((p, index) => (
                            <tr key={p.id}>
                                <td className="p-2 border">{index + 1}</td>
                                <td className="p-2 border">{p.target}</td>
                                <td className="p-2 border">{p.reference}</td>
                                <td className="p-2 border">₦{p.amount}</td>
                                <td className="p-2 border">{p.type}</td>
                                <td className="p-2 border">{p.details}</td>
                                <td className="p-2 border">{new Date(p.created_at).toLocaleString()}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage(prev => prev - 1)}
                    className="px-3 py-1 border text-white bg-gray-700 rounded disabled:opacity-50"
                >
                    Prev
                </button>
                <span>Page {pagination.page || 1} of {pagination.totalPages || 1}</span>
                <button
                    disabled={page >= (pagination.totalPages || 1)}
                    onClick={() => setPage(prev => prev + 1)}
                    className="px-3 py-1 border text-white bg-gray-700 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    )
}
