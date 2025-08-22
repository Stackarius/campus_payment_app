"use client";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link"
import { useEffect, useState } from "react";

import { FaMoneyBillWave, FaUniversity, FaCheckCircle } from "react-icons/fa";

export default function DashboardPage() {

    const [userId, setUser] = useState('')
    const [payments, setPayment] = useState([])

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser()

            if (error) {
                return error.message
            }
            setUser(data.user.id)
        }
        
        fetchUser()

        const fetchPayment = async () => {
            const { data, error } = await supabase.from("payments").select("*").eq("id", userId);
            if (!data || error) {
                return error.message
            }
            console.log(data)
            setPayment(data)
        }

        fetchPayment()

    }, [])


    const cards = [
        {
            title: "Tuition Payments",
            value: "₦150,000",
            icon: <FaUniversity size={28} />,
            color: "bg-blue-500"
        },
        {
            title: "Department Levy",
            value: "₦45,000",
            icon: <FaMoneyBillWave size={28} />,
            color: "bg-green-500"
        },
        {
            title: "Completed",
            value: payments.length,
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

            {payments.map((item) => (
                <div>
                    <p>{ item.type}</p>
                </div>
            ))}

            {/* Big Button */}
            <div className="flex justify-center">
                <Link href={'/dashboard/payment'} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-md font-semibold transition">
                    Make Payment
                </Link>
            </div>
        </div>
    );
}
