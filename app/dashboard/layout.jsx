"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

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
            <Sidebar />
            <main className="flex-1 h-[100%] overflow-y-scroll bg-gray-100 p-6">{loading ? children : <p>Loading</p>}</main>
        </div>
    );
}
