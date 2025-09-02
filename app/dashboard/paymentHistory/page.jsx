'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "react-toastify"

export default function PaymentHistory() {
    const [payments, setPayments] = useState([])
    const [pagination, setPagination] = useState({})
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true)
            try {
                //  Get session (needed to pass JWT token to API)
                const {
                    data: { session },
                } = await supabase.auth.getSession()

                if (!session) {
                    toast.error("You must be logged in to view payments")
                    setLoading(false)
                    return
                }

                //  Fetch payments from API
                const res = await fetch(`/api/student/payment?page=${page}&limit=10`, {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                })

                if (!res.ok) {
                    throw new Error(`Error ${res.status}`)
                }

                const data = await res.json()
                setPayments(data?.payments || [])
                setPagination(data?.pagination || {})
            } catch (err) {
                console.error("Error fetching payments", err)
                toast.error("Error fetching payments")
            } finally {
                setLoading(false)
            }
        }

        fetchPayments()
    }, [page])

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Payment History</h1>

            {/* Table */}
            <table className="w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border">#</th>
                        <th className="p-2 border">Student ID</th>
                        <th className="p-2 border">Amount</th>
                        <th className="p-2 border">Type</th>
                        <th className="p-2 border">Date</th>
                    </tr>
                </thead>
                <tbody className="text-center">
                    {loading ? (
                        <tr>
                            <td colSpan="5" className="p-4 text-center">
                                Loading...
                            </td>
                        </tr>
                    ) : payments.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="p-4 text-center">
                                No payments found
                            </td>
                        </tr>
                    ) : (
                        payments.map((p, index) => (
                            <tr key={p.id}>
                                <td className="p-2 border">{(page - 1) * 10 + (index + 1)}</td>
                                <td className="p-2 border">{p.student_id}</td>
                                <td className="p-2 border">₦{p.amount}</td>
                                <td className="p-2 border">{p.type}</td>
                                <td className="p-2 border">
                                    {new Date(p.created_at).toLocaleString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="px-3 py-1 border text-white bg-gray-700 rounded disabled:opacity-50"
                >
                    Prev
                </button>
                <span>
                    Page {pagination.page || 1} of {pagination.totalPages || 1}
                </span>
                <button
                    disabled={page >= (pagination.totalPages || 1)}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="px-3 py-1 border text-white bg-gray-700 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    )
}
