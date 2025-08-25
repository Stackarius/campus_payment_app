'use client'

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import schoolsData from "@/util/schoolsData.json"

export default function ProfileRegistration() {
    const [ID, setID] = useState("");
    const [form, setForm] = useState({
        fullname: "",
        matric: "",
        school: "",
        department: "",
        level: "",
        phone: "",
        sex: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch current user ID
    useEffect(() => {
        const getUser = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error) {
                    toast.error(`Failed to fetch user: ${error.message}`);
                    return;
                }
                setID(data.user.id);
            } catch (err) {
                toast.error("Unexpected error fetching user");
                console.error(err);
            }
        };
        getUser();
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
            // Reset department when school changes
            ...(name === "school" ? { department: "" } : {})
        }));
    };

    // Update student data
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!ID || !form.fullname || !form.matric) {
            toast.error("Please fill in Full Name and Matric Number");
            return;
        }

        // Build payload with only defined fields
        const payload = {};
        if (form.fullname) payload.full_name = form.fullname;
        if (form.matric) payload.student_id = form.matric;
        if (form.school) payload.school = form.school;
        if (form.department) payload.department = form.department;
        if (form.level) payload.level = form.level;
        if (form.phone) payload.phone = form.phone;
        if (form.sex) payload.sex = form.sex

        if (Object.keys(payload).length === 0) {
            toast.error("No fields provided for update");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update(payload)
                .eq("id", ID);

            if (error) {
                toast.error(`Failed to update profile: ${error.message}`);
                console.error("Supabase update error:", error);
                return;
            }

            toast.success("Profile updated successfully");
            // Optional: Reset form after success
            setForm({
                fullname: "",
                matric: "",
                school: "",
                department: "",
                level: "",
                phone: "",
                sex: ""
            });
        } catch (err) {
            toast.error("An unexpected error occurred");
            console.error("Unexpected error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get departments for the selected school
    const getDepartments = () => {
        const selectedSchool = schoolsData.schools.find(
            (school) => school.name === form.school
        );
        return selectedSchool ? selectedSchool.departments : [];
    };

    return (
        <div className="p-6 space-y-4">
            <h2 className="font-bold text-2xl">Profile Registration</h2>
            <p>Provide all needed fields to complete your profile registration.</p>

            {/* Form */}
            <form onSubmit={handleUpdate} className="w-[80%] max-w-[400px] space-y-4">
                <div className="flex flex-col gap-1">
                    <label htmlFor="fullname" className="font-semibold">Full Name</label>
                    <input
                        type="text"
                        name="fullname"
                        id="fullname"
                        value={form.fullname}
                        onChange={handleChange}
                        className="w-full p-1 border rounded"
                        required
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="matric" className="font-semibold">Matric Number</label>
                    <input
                        type="text"
                        name="matric"
                        id="matric"
                        value={form.matric}
                        onChange={handleChange}
                        className="w-full p-1 border rounded"
                        required
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="school" className="font-semibold">School</label>
                    <select
                        name="school"
                        id="school"
                        value={form.school}
                        onChange={handleChange}
                        className="border rounded py-2"
                    >
                        <option value="" disabled>Select School</option>
                        {schoolsData.schools.map((school) => (
                            <option key={school.name} value={school.name}>
                                {school.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="department" className="font-semibold">Department</label>
                    <select
                        name="department"
                        id="department"
                        value={form.department}
                        onChange={handleChange}
                        className="border rounded py-2"
                        disabled={!form.school}
                    >
                        <option value="" disabled>Select Department</option>
                        {getDepartments().map((dept) => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="level" className="font-semibold">Level</label>
                    <select
                        name="level"
                        id="level"
                        value={form.level}
                        onChange={handleChange}
                        className="border rounded py-2"
                    >
                        <option value="" disabled>Select Level</option>
                        <option value="ND I">ND I</option>
                        <option value="ND II">ND II</option>
                        <option value="HND I">HND I</option>
                        <option value="HND II">HND II</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="sex" className="font-semibold">Sex</label>
                    <select
                        name="sex"
                        id="sex"
                        value={form.sex}
                        onChange={handleChange}
                        className="border rounded py-2"
                    >
                        <option value="" disabled>Select Sex</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="phone" className="font-semibold">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full p-1 border rounded"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 px-4 py-1 text-white text-md font-semibold rounded disabled:bg-gray-400"
                >
                    {isSubmitting ? "Updating..." : "Update"}
                </button>
            </form>
        </div>
    );
}