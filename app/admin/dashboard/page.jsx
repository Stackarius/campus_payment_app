"use client";

import { FaMoneyBillWave, FaUniversity, FaCheckCircle } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function DashboardPage() {
    const router = useRouter();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Fetch payments from Supabase
    useEffect(() => {
        const fetchData = async () => {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || userData?.user) {
                router.push("/admin/login");
                return;
            }

            const { data, error } = await supabase
                .from("payments")
                .select("amount, created_at, status"); // adjust columns as per schema

            if (error) {
                console.error("Error fetching payments:", error.message);
                setPayments([]);
            } else {
                setPayments(data || []);
            }

            setLoading(false);
        };

        fetchData();
    }, [router]);

    // Extract available years dynamically
    const availableYears = useMemo(() => {
        const years = payments.map((p) => new Date(p.created_at).getFullYear());
        return [...new Set(years)].sort((a, b) => b - a); // sort descending
    }, [payments]);

    // Filter payments by selected year
    const filteredPayments = useMemo(() => {
        return payments.filter(
            (p) => new Date(p.created_at).getFullYear() === selectedYear
        );
    }, [payments, selectedYear]);

    // Monthly totals for chart
    const monthlyTotals = Array(12).fill(0);
    filteredPayments.forEach((payment) => {
        const month = new Date(payment.created_at).getMonth(); // 0 = Jan
        monthlyTotals[month] += payment.amount;
    });

    const chartData = {
        labels: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ],
        datasets: [
            {
                label: `Payments Received (${selectedYear})`,
                data: monthlyTotals,
                borderColor: "#4F46E5",
                backgroundColor: "rgba(79,70,229,0.1)",
                fill: true,
                tension: 0.3,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: true } },
    };

    // Card values
    const totalTuition = filteredPayments
        .filter((p) => p.type === "tuition")
        .reduce((sum, p) => sum + p.amount, 0);

    const totalLevy = filteredPayments
        .filter((p) => p.type === "levy")
        .reduce((sum, p) => sum + p.amount, 0);

    const cards = [
        {
            title: "Tuition Payments",
            value: `₦${totalTuition.toLocaleString()}`,
            icon: <FaUniversity size={28} />,
            color: "bg-blue-500",
        },
        {
            title: "Department Levy",
            value: `₦${totalLevy.toLocaleString()}`,
            icon: <FaMoneyBillWave size={28} />,
            color: "bg-green-500",
        },
        {
            title: "Completed",
            value: filteredPayments.length,
            icon: <FaCheckCircle size={28} />,
            color: "bg-purple-500",
        },
    ];

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <img
                    src="https://ui-avatars.com/api/?name=Student+User"
                    alt="profile"
                    className="w-10 h-10 rounded-full border"
                />
            </div>

            {loading ? (
                <p>Loading data...</p>
            ) : (
                <>
                    {/* Year Filter */}
                    <div className="flex justify-end">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="border rounded-lg px-3 py-2"
                        >
                            {availableYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {cards.map((card, i) => (
                            <div
                                key={i}
                                className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition flex items-center gap-4"
                            >
                                <div className={`${card.color} text-white p-3 rounded-xl`}>
                                    {card.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{card.title}</p>
                                    <h2 className="text-xl font-semibold">{card.value}</h2>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <h2 className="mb-4 font-semibold text-gray-700">Payment Trends</h2>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </>
            )}
        </div>
    );
}
