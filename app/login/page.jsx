'use client'
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await login(email, password);

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("user_role")
                .eq("id", user.id)
                .single();

            if (profileError || !profile) {
                toast.error("Error fetching user profile.");
                setLoading(false);
                return;
            }

            toast.success("Login successful!");
            setLoading(false);
            router.push(profile.user_role === "admin" ? "/admin/dashboard" : "/dashboard");
        } catch {
            toast.error("Login failed. Check your credentials.");
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <Header />
            {/* Background Hero */}
            <div className="absolute inset-0">
                <img
                    src="/campus.jpg"
                    alt="Campus Background"
                    className="w-full h-full object-cover brightness-50"
                />
            </div>

            {/* Form Card */}
            <motion.form
                onSubmit={handleLogin}
                className="relative bg-white bg-opacity-95 p-10 rounded-3xl shadow-2xl w-full max-w-md z-10 backdrop-blur-sm"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
            >
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-blue-700">
                    Swift Login
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <div className="flex justify-between items-center mb-4">
                    <Link href="/" className="text-sm text-blue-500 hover:underline">
                        Forgot Password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <div className="flex items-center justify-center my-4 gap-2 text-gray-600">
                    <p>Don't have an account?</p>
                    <Link href="/signup" className="text-blue-500 font-semibold hover:underline">
                        Register Now
                    </Link>
                </div>

                <div className="text-center">
                    <Link href="/admin/adminAuth" className="text-sm text-blue-700 hover:underline">
                        Login as Admin
                    </Link>
                </div>
            </motion.form>
        </div>
    );
}
