"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";
import Image from "next/image";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

function ResetPasswordContent() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("access_token");

    async function handleReset(e) {
        e.preventDefault();
        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({ password });
            if (error) {
                setMessage(error.message);
            } else {
                setMessage("Password updated! Redirecting...");
                setTimeout(() => router.push("/login"), 2000);
            }
        } catch (err) {
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative w-full min-h-screen bg-gray-100 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 flex flex-col overflow-hidden">
            {/* Header */}
            <Header />

            <div className=" mt-10 md:mt-20 z-20 flex flex-1 flex-col md:flex-row items-center justify-center px-4 md:px-16 py-12 gap-12">
                {/* Form Section */}
                <div className="w-full max-w-md">
                    <form
                        onSubmit={handleReset}
                        className="flex flex-col mt-10 md:mt-0 gap-4 bg-blue-600 backdrop-blur-md p-8 rounded-2xl shadow-xl text-white"
                    >
                        <h2 className="text-3xl font-bold text-center mb-6">Reset Password</h2>

                        <div className="flex flex-col">
                            <label className="font-medium mb-1">New Password</label>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="p-3 rounded-lg border border-gray-600 bg-black/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-white text-black py-3 rounded-lg font-semibold transition-all duration-200"
                        >
                            {loading ? "Please wait..." : "Update Password"}
                        </button>

                        {message && <p className="text-center text-white/70 mt-2">{message}</p>}
                    </form>
                </div>


            </div>

            <picture className="fixed top-0 left-0 max-w-full z-10">
                <img src="/campus.jpg" loading="lazy" alt="campus photo" />
            </picture>


            <Footer />
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <ResetPasswordContent />
        </Suspense>
    );
}


