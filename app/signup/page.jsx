"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { signup } from "@/lib/auth";

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
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSignup}
                className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
            >
                <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 border rounded mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 border rounded mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600"
                >
                    {loading ? "Creating..." : "Register"}
                </button>

                <div className="flex items-center justify-center mt-2 gap-3">
                    <p>Already a user?</p>
                    <Link href="/login" className="font-semibold">
                        Login
                    </Link>
                </div>
            </form>
        </div>
    );
}
