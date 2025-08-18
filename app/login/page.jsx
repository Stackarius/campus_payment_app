"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchRole, login } from "@/lib/auth";
import { toast } from "react-toastify";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState("")

    const handleLogin = async (e) => {

        e.preventDefault();

        try {
            setLoading(true)
            const user = await login(email, password);

            // Get user profile to check role
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("user_role")
                .eq("id", user.id)
                .single();

            if (profileError || !profile) {
               alert("Error fetching user profile.");
                setLoading(false);
                return;
            }

            // user == admin => "/admin" : "/dashboard"
            if (profile && profile.user_role === "admin") {
                setLoading(false)
                toast.success("Login successful!")
                router.push("/admin");
            } else {
                setLoading(false)
                toast.success("Login successful!")
                router.push("/dashboard");
            }
        } catch (err) {
            setLoading(false);
        }
    };


    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
            >
                <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
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
                <Link href={"/"} className="float-right">Forgot Password</Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-3 mt-2 rounded hover:bg-blue-600"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <div className="flex items-center justify-center mt-2 gap-3">
                    <p>Don't have an account?</p>
                    <Link href={"/signup"} className="font-semibold">Register Now</Link>
                </div>
            </form>
        </div>
    );
}
