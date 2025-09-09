'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { signup } from "@/lib/auth";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await signup({ email, password });

        setLoading(false);
        if (error) {
            toast.error(error);
        } else {
            toast.success("Check your email to confirm your account");
            router.push("/login");
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50">
            {/* Background Hero */}
            <Header  />
            <div className="absolute inset-0">
                <img
                    src="/campus.jpg"
                    alt="Campus Background"
                    className="w-full h-full object-cover brightness-50"
                />
            </div>

            {/* Form Card */}
            <motion.form
                onSubmit={handleSignup}
                className="relative bg-white bg-opacity-80 p-10 rounded-3xl shadow-2xl w-full max-w-md z-70 backdrop-blur-sm"
                viewport={{ once: true, amount: 0.8 }}
                variants={fadeUp}
            >
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-blue-700">
                    Create Your Account
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                    {loading ? "Creating..." : "Register"}
                </button>

                <div className="flex items-center justify-center my-4 gap-2 text-gray-600">
                    <p>Already have an account?</p>
                    <Link href="/login" className="text-blue-500 font-semibold hover:underline">
                        Login
                    </Link>
                </div>

                <div className="text-center">
                    <Link href="/admin/adminAuth" className="text-sm text-blue-700 hover:underline">
                        Register as Admin
                    </Link>
                </div>
            </motion.form>
        </div>
    );
}
