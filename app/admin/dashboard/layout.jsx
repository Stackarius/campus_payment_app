"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AdminBoard from "@/components/AdminBoard";
import { toast } from "react-toastify";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }) {
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
        const router = useRouter();

        useEffect(() => {
            const checkAuth = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error || !data?.user) {
                router.push("/admin/adminAuth");
                return;
            }

            const userId = data.user.id;

            const { data: userProfile, error: profileError } = await supabase
                .from("profiles")
                .select("user_role")
                .eq("id", userId)
                .single();

            if (profileError || !userProfile) {
                router.push("/admin/adminAuth");
                return;
            }

            setRole(userProfile.user_role);

            if (userProfile.user_role === "admin") {
                toast.success("Login Successful!");
            } else {
                toast.error("User is unauthorized");
                router.push("/login");
                return;
            }

            setLoading(false);
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden relative">
            {/* Sidebar */}
            {role === "admin" && (
                <>
                    {/* Mobile Drawer */}
                    <div
                        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md transform transition-transform duration-300 z-40 md:hidden
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
                    >
                        <AdminBoard closeSidebar={() => setSidebarOpen(false)} />
                    </div>

                    {/* Desktop Sidebar (always visible) */}
                    <div className="hidden md:block w-64 bg-white shadow-md">
                        <AdminBoard />
                    </div>
                </>
            )}

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <main className="flex-1 h-full overflow-y-scroll bg-gray-100 p-6 relative z-10">
                {/* Toggle Button (only on mobile) */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute top-4 left-4 z-50 p-2 rounded-xl bg-white shadow-md hover:bg-gray-100 transition md:hidden"
                >
                    <Menu size={20} />
                </button>

                {children}
            </main>
        </div>
    );
}
