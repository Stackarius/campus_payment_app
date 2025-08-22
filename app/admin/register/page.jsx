'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminRegister() {

    const [form, setForm] = useState({
        email: "",
        password: "",
        role: "super_admin"
    })

    const [message, setMessage] = useState('')
    const router = useRouter()

    const handleRegister = async (e) => {
        e.preventDefault()

        const response = await fetch('api/admin/register', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({email: form.email, password: form.password, role: form.role})
        })

        const data = await response.json()

        if (!response.ok) {
            setMessage(data.message || 'Registration failed...')
        } else {
            setMessage(data.message)
            router.push("/admin/login")
        }
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Register</h1>
            {message && <p className="text-red-500 mb-4">{message}</p>}
            <form onSubmit={handleRegister} className="space-y-4">
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
                <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full p-2 border rounded"
                >
                    <option value="finance">Finance</option>
                    <option value="super_admin">Super Admin</option>
                </select>
                <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
                    Register
                </button>
            </form>
        </div>
    )
}