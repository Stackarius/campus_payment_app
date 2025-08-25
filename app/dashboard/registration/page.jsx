'use client'

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react"
import { toast } from "react-toastify";

export default function ProfileRegistration() {

    const [ID, setID] = useState("")

    const [form, setForm] = useState({
        fullname: "",
        matric: "",
        level: "",
        phone: "",
    })
    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // fetch current user or active session
    useEffect(() => {
        const getUser = async () => {
            const { data, error } = await supabase.auth.getUser()
            if (error) {
                return error.message
            }

            setID(data.user.id)
            return
        }
    }, [])

    const handleUpdate = async () => {
        const { error } = await supabase.from("profiles").upsert({
            full_name: form.fullname,
            matric: form.matric,
            level: form.level,
            phone: form.phone,
        }).eq('id', data.user.id)

        if (error) {
            return error.message
        }
        toast.success("Profile updated successfully")
        return
    }

    return (
        <div className="p-6 space-y-4">
            <h2 className="font-bold text-2xl">Profile Registration</h2>
            <p>Provide all needed fields to complete your profile registration.</p>

            {/* Form */}
            <form >
                <div className="flex flex-col gap-1">
                    <label htmlFor="fullname" className="font-semibold">Fullname</label>
                    <input type="text"
                        name="fullname"
                        id="fullname"
                        value={form.fullname}
                        onChange={handleChange}
                        className="w-full p-1 border rounded mb-4" />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="matric" className="font-semibold">Matric No</label>
                    <input type="matric"
                        name="matric"
                        id="matric"
                        value={form.matric}
                        onChange={handleChange}
                        className="w-full p-1 border rounded mb-4" />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="level" className="font-semibold">Level</label>
                    <select name="level" id="level" onChange={handleChange}>
                        <option value="ND 1">ND I</option>
                        <option value="ND 1">ND II</option>
                        <option value="ND 1">HND I</option>
                        <option value="ND 1">HND II</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="fullname" className="font-semibold">Fullname</label>
                    <input type="text"
                        name="fullname"
                        id="fullname"
                        value={form.fullname}
                        onChange={handleChange}
                        className="w-full p-1 border rounded mb-4" />
                </div>
            </form>
        </div>
    )
}