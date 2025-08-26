'use client'

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react"
import { toast } from "react-toastify";

export default function PaymentHistory() {
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1);
    const [payments, setPayments] = useState([]);
    const [pagination, setPagination] = useState({});
    const [limit] = useState(5);
    const [ID, setID] = useState('')
    const [user, setUser] = useState('')


    useEffect(() => {

        const fetchData = async () => {
            const { data, error } = await supabase.auth.getUser()
            
            if (error) {
                return error.message
            }
            setID(data.user.id)

            const { data: profile, error: profileError } = await supabase.from('profiles').select('student_id').eq('id', data.user.id).single()
            
            if (profileError) {
                console.log('Error fetching profile', profileError.message)
                toast.error('Error fetching profile')
            }
            setUser(profile)
            return
        }

        async function fetchPayments() {
            setLoading(true)
            try {
                const res = await fetch(`/api/fetchPayment?page=${page}&studentID=${user}&limit=${limit}`)

                const data = await res.json()
                setPayments(data.payments)
                setPagination(data?.pagination)
                setLoading(false)
            } catch (err) {
                console.error("Error fetching payments", err);
                setLoading(false)
            }
        }
        fetchData()
        fetchPayments()
    }, [page])

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Payment History</h1>

            {/* Table */}
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border">ID</th>
                        <th className="p-2 border">Student</th>
                        <th className="p-2 border">Amount</th>
                        <th className="p-2 border">Type</th>
                        <th className="p-2 border">Date</th>
                    </tr>
                </thead>
                <tbody className="text-center">
                    {loading ? (
                        <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
                    ) : payments.length === 0 ? (
                        <tr><td colSpan="5" className="p-4 text-center">No payments found</td></tr>
                    ) : (
                        payments.map((p, index) => (
                            <tr key={p.id}>
                                <td className="p-2 border">{index}</td>
                                <td className="p-2 border">{p.student_id}</td>
                                <td className="p-2 border">₦{p.amount}</td>
                                <td className="p-2 border">{p.type}</td>
                                <td className="p-2 border">{new Date(p.created_at).toLocaleString()}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 ">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 border text-white bg-gray-700 rounded disabled:opacity-50"
                >
                    Prev
                </button>
                <span>
                    Page {pagination.page} of {pagination.totalPages || 1}
                </span>
                <button
                    disabled={page >= (pagination.totalPages || 1)}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 border text-white bg-gray-700 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    )
}