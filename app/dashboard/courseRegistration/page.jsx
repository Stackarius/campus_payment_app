"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CourseRegistration() {
    const [semester, setSemester] = useState("");
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (semester) {
            const fetchCourses = async () => {
                let { data, error } = await supabase
                    .from("courses")
                    .select("*")
                    .eq("semester", semester);
                if (!error) setCourses(data);
            };
            fetchCourses();
        }
    }, [semester]);

    const handleSelect = (courseId) => {
        setSelectedCourses((prev) =>
            prev.includes(courseId)
                ? prev.filter((id) => id !== courseId)
                : [...prev, courseId]
        );
    };

    const handleSubmit = async () => {
        if (!semester || selectedCourses.length === 0) {
            alert("Please select a semester and at least one course.");
            return;
        }

        setLoading(true);
        const user = (await supabase.auth.getUser()).data.user;

        const { error } = await supabase.from("registrations").insert(
            selectedCourses.map((courseId) => ({
                profile_id: user.id, // profiles.id == auth.users.id
                course_id: courseId,
                semester,
            }))
        );

        setLoading(false);

        if (error) {
            alert(error.message);
        } else {
            alert("Registration successful!");
            setSelectedCourses([]);
        }
    };

    return (
        <div className="p-6">
            <h2 className="font-bold text-2xl mb-8">Course Registration</h2>

            <select
                onChange={(e) => setSemester(e.target.value)}
                value={semester}
                className="bg-white p-2 mb-4 rounded border"
            >
                <option value="">-- Select Semester --</option>
                <option value="1">First Semester</option>
                <option value="2">Second Semester</option>
            </select>

            {/* Courses Table */}
            {courses.length > 0 && (
                <table className="bg-white border rounded w-full max-w-3xl text-left">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">Select</th>
                            <th className="p-2 border">Course Code</th>
                            <th className="p-2 border">Course Title</th>
                            <th className="p-2 border">Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.id} className="hover:bg-gray-50">
                                <td className="p-2 border text-center">
                                    <input
                                        type="checkbox"
                                        value={course.id}
                                        onChange={() => handleSelect(course.id)}
                                        checked={selectedCourses.includes(course.id)}
                                    />
                                </td>
                                <td className="p-2 border">{course.course_code}</td>
                                <td className="p-2 border">{course.course_name}</td>
                                <td className="p-2 border">{course.unit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-6 py-2 text-md font-semibold text-white my-6 rounded ${loading
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
            >
                {loading && (
                    <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                    </svg>
                )}
                {loading ? "Registering..." : "Proceed"}
            </button>
        </div>
    );
}
