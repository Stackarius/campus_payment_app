"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaMoneyBillWave, FaUniversity, FaCheckCircle } from "react-icons/fa";

/* -------------------- UI Components -------------------- */
function StatCard({ title, value, icon, color }) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition flex items-center gap-4">
            <div className={`${color} text-white p-3 rounded-xl`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <h2 className="text-xl font-semibold">{value}</h2>
            </div>
        </div>
    );
}

function PaymentList({ payments }) {
    if (!payments.length) {
        return <p className="text-gray-500 text-sm">No payments recorded yet.</p>;
    }

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "success":
            case "completed":
                return "text-green-600 bg-green-100";
            case "pending":
                return "text-yellow-600 bg-yellow-100";
            case "failed":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    return (
        <ul className="divide-y">
            {payments.map(({ id, type, amount, status, created_at, source }) => (
                <li
                    key={id}
                    className="flex justify-between py-3 text-sm items-center"
                >
                    <div>
                        <p className="font-medium capitalize">
                            {type}
                            <span className="ml-2 text-xs text-gray-400">
                                ({source})
                            </span>
                        </p>
                        <p className="text-xs text-gray-500">
                            {formatDate(created_at)}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-gray-700 font-semibold">
                            ₦{amount}
                        </span>
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                status
                            )}`}
                        >
                            {status}
                        </span>
                    </div>
                </li>
            ))}
        </ul>
    );
}

function DashboardHeader({ displayName, matric }) {
    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold">Welcome, {displayName}</h1>
                {matric && <h2 className="text-lg font-semibold">{matric}</h2>}
                <p className="text-gray-500">
                    Here’s a snapshot of your financial activity
                </p>
            </div>
            <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName
                )}`}
                alt="profile"
                className="w-12 h-12 rounded-full border"
            />
        </div>
    );
}

/* -------------------- Main Page -------------------- */
export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!session?.user) return;

                // Fetch profile
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                setUser(profile);

                const headers = {
                    Authorization: `Bearer ${session.access_token}`,
                };

                // Fetch student + merchant payments in parallel
                const [studentRes, merchantRes] = await Promise.all([
                    fetch(`/api/student/payment?limit=10`, { headers }),
                    fetch(`/api/payment/fetch_payment?limit=5`, { headers }),
                ]);

                const studentData = studentRes.ok ? await studentRes.json() : {};
                const merchantData = merchantRes.ok ? await merchantRes.json() : {};

                const studentPayments = (studentData.payments || []).map((p) => ({
                    id: p.id,
                    type: p.type || "Student Payment",
                    amount: p.amount,
                    status: p.status,
                    created_at: p.created_at,
                    source: "student",
                }));

                const merchantPayments = (merchantData.payments || []).map((p) => ({
                    id: p.id,
                    type: p.payment_type || "Merchant Payment",
                    amount: p.amount,
                    status: p.status,
                    created_at: p.created_at,
                    source: "merchant",
                }));

                const combined = [...studentPayments, ...merchantPayments]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 5);

                setPayments(combined);
            } catch (err) {
                console.error("Dashboard fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const completedCount = payments.filter(
        (p) => p.status === "completed" || p.status === "success"
    ).length;

    const cards = [
        {
            title: "Total Payments",
            value: payments.length,
            icon: <FaMoneyBillWave size={28} />,
            color: "bg-gradient-to-r from-green-500 to-green-600",
        },
        {
            title: "Student Payments",
            value: payments.filter((p) => p.source === "student").length,
            icon: <FaUniversity size={28} />,
            color: "bg-gradient-to-r from-blue-500 to-blue-600",
        },
        {
            title: "Completed",
            value: completedCount,
            icon: <FaCheckCircle size={28} />,
            color: "bg-gradient-to-r from-purple-500 to-purple-600",
        },
    ];

    const displayName = user?.full_name || "Student";
    const matric = user?.student_id || "";

    return (
        <div className="p-6 space-y-10">
            <DashboardHeader displayName={displayName} matric={matric} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <StatCard key={card.title} {...card} />
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-lg font-semibold mb-3">Recent Payments</h2>
                {loading ? (
                    <p className="text-gray-400 text-sm">Loading payments...</p>
                ) : (
                    <PaymentList payments={payments} />
                )}
            </div>

            <div className="flex justify-center">
                <Link
                    href="/dashboard/payment"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-md font-semibold transition"
                >
                    Make Payment
                </Link>
            </div>
        </div>
    );
}
