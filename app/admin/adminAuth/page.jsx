'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

export default function AdminAuth() {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(true)
    const [form, setForm] = useState({ email: "", password: "" })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        const endpoint = isLogin ? "/api/admin/login" : "/api/admin/register"

        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        })

        const data = await response.json()
        setLoading(false)

        if (!response.ok) {
            setMessage(data.message || "Action failed")
        } else {
            setMessage(data.message)
            if (isLogin && data.user) router.push('/admin/dashboard')
            if (!isLogin) router.push('/admin/adminAuth')
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50">
            <div className="absolute inset-0">
                <img
                    src="/campus.jpg"
                    alt="Campus Background"
                    className="w-full h-full object-cover brightness-50"
                />
            </div>

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

                {message && <p className="text-red-500 mb-4 text-center">{message}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition"
                    >
                        {loading ? (isLogin ? "Logging in..." : "Registering...") : (isLogin ? "Login" : "Register")}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-700 font-semibold hover:underline"
                    >
                        {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
