"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { FaBars, FaTimes } from "react-icons/fa";

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setLoading(false)
                router.replace("/login");
            } else {
                setLoading(true);
            }
        };
        checkAuth();
    }, [router]);

    return (
        <div className="flex h-[100vh] overflow-y-hidden">
            {isOpen && <Sidebar />}
            <main className="flex-1 h-[100%] overflow-y-scroll bg-gray-100 p-6">{loading ? children : <p>Loading</p>}</main>
            {/* Menu button */}
            {!isOpen ?
                <FaBars size={20} onClick={() => setIsOpen(!isOpen)} className="fixed top-12 right-7 cursor-pointer transition-all duration-300 ease-in-out" />
                :
                <FaTimes size={20} onClick={() => setIsOpen(!isOpen)} className="fixed top-12 right-7 cursor-pointer transition-all duration-300 ease-in-out" />
            }
        </div>
    );
}
