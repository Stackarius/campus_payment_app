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
    Legend
} from "chart.js";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function DashboardPage() {

    const fetchSession = async () => {
        const {error } = await supabase.auth.getUser()

        if (error) {
            redirect("/admin/login")
        }
        return
    }

    const [payments, setPayments] = useState()

    useEffect(() => {
        async function fetchPayments() {
            try {
                const res = await fetch(
                    `/api/fetchPayment`
                );
                const data = await res.json();
                setPayments(data.payments.length);
            } catch (err) {
                console.error("Error fetching payments", err);
            }
        }
        fetchSession()

        fetchPayments();
    }, []);

    const chartData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Payments Received",
                data: [50000, 75000, 30000, 90000, 65000, 80000],
                borderColor: "#4F46E5",
                backgroundColor: "rgba(79,70,229,0.1)",
                fill: true,
                tension: 0.3
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: true } }
    };

    const cards = [
        {
            title: "Tuition Payments",
            value: "₦150,000",
            icon: <FaUniversity size={28} />,
            color: "bg-blue-500"
        },
        {
            title: "Department Levy",
            value: "₦5,000",
            icon: <FaMoneyBillWave size={28} />,
            color: "bg-green-500"
        },
        {
            title: "Completed",
            value: payments,
            icon: <FaCheckCircle size={28} />,
            color: "bg-purple-500"
        }
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
        </div>
    );
}
