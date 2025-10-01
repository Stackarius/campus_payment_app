'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabaseClient"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

export default function AdminAuth() {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(true)
    const [form, setForm] = useState({ email: "", password: "", staffID: "" })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    const updateField = (field, value) => setForm({ ...form, [field]: value })

    const handleError = async (msg, signOut = false) => {
        setMessage(msg)
        if (signOut) await supabase.auth.signOut()
        setLoading(false)
    }

    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
        })

        if (error) return handleError(error.message)

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("user_role, staff_id")
            .eq("id", data.user.id)
            .single()

        if (profileError || !profile) return handleError("Error fetching user profile", true)

        // Check role
        if (!["admin", "super_admin"].includes(profile.user_role)) {
            return handleError("Access denied. Admin privileges required.", true)
        }

        setMessage("Login successful! Redirecting...")
        setTimeout(() => {
            router.push("/admin/dashboard")
            router.refresh()
        }, 1000)
    }

    const handleRegister = async () => {
        const response = await fetch("/api/admin/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })

        const data = await response.json()
        if (!response.ok) return setMessage(data.message || "Registration failed")

        setMessage(data.message)
        setTimeout(() => {
            setIsLogin(true)
            setForm({ email: form.email, password: "", staffID: "" })
        }, 2000)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")
        try {
            isLogin ? await handleLogin() : await handleRegister()
        } catch (err) {
            console.error("Auth error:", err)
            setMessage("Network error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50">
            <Header />

            {/* Background */}
            <div className="absolute inset-0">
                <img
                    src="/campus.jpg"
                    alt="Campus Background"
                    className="w-full h-full object-cover brightness-50"
                />
            </div>

            {/* Auth Box */}
            <motion.div
                className="relative bg-white bg-opacity-95 p-10 rounded-3xl shadow-2xl w-full max-w-md z-10 backdrop-blur-sm"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-blue-700">
                    {isLogin ? "Admin Login" : "Admin Register"}
                </h1>

                {message && (
                    <p
                        className={`mb-4 text-center ${message.includes("successful") ? "text-green-500" : "text-red-500"
                            }`}
                    >
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                    />

                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Staff ID"
                            value={form.staffID}
                            onChange={(e) => updateField("staffID", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                        />
                    )}

                    <input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition disabled:opacity-50"
                    >
                        {loading
                            ? isLogin
                                ? "Logging in..."
                                : "Registering..."
                            : isLogin
                                ? "Login"
                                : "Register"}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setMessage("")
                            setForm({ email: "", password: "", staffID: "" })
                        }}
                        className="text-blue-700 font-semibold hover:underline"
                    >
                        {isLogin
                            ? "Don't have an account? Register"
                            : "Already have an account? Login"}
                    </button>
                </div>
            </motion.div>

            <div className="fixed bottom-0 w-full text-white">

                <Footer />
            </div>
        </div>
    )
}
