"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import Header from "@/components/Header";
import Image from "next/image";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setLoading(true);
            // await sendPasswordReset(email);
            toast.success("Check your email to proceed with reset");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative w-full min-h-screen bg-gray-100 bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-700 flex flex-col overflow-hidden">
            {/* Header */}
            <Header />

            <div className="mt-10 md:mt-20 z-20 flex flex-1 flex-col md:flex-row items-center justify-center px-4 md:px-16 py-12 gap-12">
                {/* Form Section */}
                <div className="w-full max-w-md">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col mt-10 md:mt-0 gap-4 bg-blue-600 backdrop-blur-md p-8 rounded-2xl shadow-xl text-white"
                    >
                        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>

                        <div className="flex flex-col">
                            <label className="font-medium mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="p-3 rounded-lg border border-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-black hover:bg-black/80 cursor-pointer text-white py-3 rounded-lg font-semibold transition-all duration-200"
                        >
                            {loading ? "Please wait..." : "Send Reset Link"}
                        </button>

                        <p className="text-center text-white mt-2">
                            Remembered your password?{" "}
                            <a href="/login" className="text-yellow-400 font-semibold hover:underline">
                                Login
                            </a>
                        </p>
                    </form>
                </div>


            </div>

            <picture className="fixed top-0 left-0 max-w-full z-10">
                <img src="/campus.jpg" loading="lazy" alt="campus photo" />
            </picture>

            <span className="z-20">

                <Footer />
            </span>
        </div>
    );
}


