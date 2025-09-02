"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
    LayoutDashboard,
    User,
    CreditCard,
    LogOut,
} from "lucide-react";

export default function AdminBoard({ closeSidebar }) {
    const router = useRouter();
    const pathname = usePathname();

    const sideLinks = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Profile", href: "/admin/dashboard/profile", icon: User },
        { name: "Payments", href: "/admin/dashboard/payment", icon: CreditCard },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="h-screen w-64 bg-gray-800 text-white flex flex-col">
            {/* Logo / Title */}
            <div className="p-4 text-2xl md:mt-8 font-bold">Swift</div>

            {/* Nav Links */}
            <nav className="flex-1 px-4 space-y-2">
                {sideLinks.map(({ name, href, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={closeSidebar}
                            className={`flex items-center gap-3 py-2 px-3 rounded-lg transition ${isActive
                                    ? "bg-white text-blue-700 font-semibold"
                                    : "text-gray-200 hover:bg-white hover:text-blue-700"
                                }`}
                        >
                            <Icon size={18} />
                            {name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 bg-red-500 hover:bg-red-600 p-3 m-4 rounded transition text-white"
            >
                <LogOut size={18} />
                Logout
            </button>
        </div>
    );
}
