'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminLogin() {

    const [form, setForm] = useState({ email: "", password: "" })
    const [message, setMessage] = useState("")
    const router = useRouter()

    const handleLogin = async (e) => {
        e.preventDefault()

        const response = await fetch("/api/admin/login", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({email: form.email, password: form.password})
        })

        const data = await response.json()

        if (!response.ok) {
            setMessage(data.message || "Login failed")
        } else {
            setMessage(data.message)
            if (data.user) router.push('/admin')
        }
    }

    return (
        <>
            <div className="max-w-md mx-auto mt-10 p-4">
                <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
                {message && <p className="text-red-500 mb-4">{message}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    />
                    <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
                        Login
                    </button>
                    <div className="flex justify-between">
                        <p>Don't have an account</p>
                        <Link href={"/admin/register"}>Register</Link>
                    </div>
                </form>
            </div>
        </>
    )
}