"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";
import AdminBoard from "@/components/AdminBoard";
import { toast } from "react-toastify";

export default function DashboardLayout({ children }) {
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState("")

    useEffect(() => {
        const checkAuth = async () => {
            const { data, error } = await supabase.auth.getUser()
            
            if (error) {
                return error.message
            }
            setRole(data.user.id)
            if (role === "admin") {
                toast.success("Login Successul!")
                setLoading(false)
            } else {
                toast.error("User is unauthorized")
                redirect("/login")
            }
        };
        checkAuth();
    }, []);

    return (
        <div className="flex h-[100vh] overflow-y-hidden">
            <AdminBoard />
            <main className="flex-1 h-[100%] overflow-y-scroll bg-gray-100 p-6">{!loading ? children : <p>Loading</p>}</main>
        </div>
    );
}
