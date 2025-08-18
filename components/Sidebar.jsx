"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth";

export default function Sidebar() {
    const router = useRouter();
    const [active, setActive] = useState(1)

    const sideLinks = [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Profile", href: "/dashboard/profile" },
        { name: "Payments", href: "/dashboard/payment" },
        { name: "Payment History", href: "/dashboard" },
    ]

    const handleChange = (idx) => {
        setActive(idx)
    }

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
    };


    return (
        <div className="h-screen w-64 bg-blue-600 text-white flex flex-col">
            <div className="p-4 text-2xl md:mt-8 font-bold">Swift</div>
            <nav className="flex-1 px-4 space-y-2">
                {sideLinks.map((item, index) => (
                    <Link key={index} href={item.href} onClick={() => handleChange(index)} className={`block py-2 hover:bg-white hover:text-blue-700 text-semibold rounded px-2 ${active && "bg-white text-blue-700"}`}>{item.name}</Link>
                ))}
            </nav>
            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 p-3 m-4 rounded"
            >
                Logout
            </button>
        </div>
    );
}
