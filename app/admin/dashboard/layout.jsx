"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";
import AdminBoard from "@/components/AdminBoard";
import { toast } from "react-toastify";

export default function DashboardLayout({ children }) {
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState("");

    useEffect(() => {
        const checkAuth = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data.user) {
                redirect("/admin/login");
                return;
            }

            const userId = data.user.id;

            const { data: userProfile, error: ProfileError } = await supabase
                .from("profiles")
                .select("user_role")
                .eq("id", userId)
                .single();

            if (ProfileError || !userProfile) {
                redirect("/admin/login");
                return;
            }

            setRole(userProfile.user_role);

            if (userProfile.user_role === "admin") {
                toast.success("Login Successful!");
                setLoading(false);
            } else {
                toast.error("User is unauthorized");
                redirect("/login");
            }
        };

        checkAuth();
    }, []);

    return (
        <div className="flex h-[100vh] overflow-y-hidden">
            <AdminBoard />
            <main className="flex-1 h-[100%] overflow-y-scroll bg-gray-100 p-6">
                {!loading ? children : <p>Loading...</p>}
            </main>
        </div>
    );
}
