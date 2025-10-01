'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Exams() {
    const [semester, setSemester] = useState(1);
    const [profileId, setProfileId] = useState(null);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatDate = (dateStr) =>
        dateStr
            ? new Date(dateStr).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            })
            : "";

    const formatTime = (timeStr) =>
        timeStr
            ? new Date(`1970-01-01T${timeStr}Z`).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            })
            : "";

    const fetchExams = async (profileId, semester) => {
        if (!profileId) return;

        setLoading(true);
        const { data: registrations, error: regError } = await supabase
            .from("registrations")
            .select("course_id")
            .eq("profile_id", profileId)
            .eq("semester", semester);

        if (regError) {
            console.error("Error fetching registrations:", regError.message);
            setLoading(false);
            return;
        }

        if (!registrations || registrations.length === 0) {
            setExams([]);
            setLoading(false);
            return;
        }

        const courseIds = registrations.map((r) => r.course_id);

        const { data: examsData, error: examsError } = await supabase
            .from("exams")
            .select(`
                id,
                exam_date,
                exam_time,
                venue,
                semester,
                courses (
                  id,
                  course_code,
                  course_name
                )
            `)
            .in("course_id", courseIds)
            .eq("semester", semester)
            .order("exam_date", { ascending: true })
            .order("exam_time", { ascending: true });

        if (examsError) {
            console.error("Error fetching exams:", examsError.message);
            setLoading(false);
            return;
        }

        setExams(examsData || []);
        setLoading(false);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();
            if (userError || !user) {
                console.error("Error fetching user:", userError?.message);
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", user.id)
                .single();

            if (profileError) {
                console.error("Error fetching profile:", profileError.message);
                return;
            }

            setProfileId(profile.id);
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        if (profileId) {
            fetchExams(profileId, semester);
        }
    }, [semester, profileId, fetchExams]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                    Exam Schedule
                </h2>

                {/* Semester Switch */}
                <div className="flex justify-center mb-6">
                    <select
                        value={semester}
                        onChange={(e) => setSemester(Number(e.target.value))}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value={1}>Semester 1</option>
                        <option value={2}>Semester 2</option>
                    </select>
                </div>

                {loading ? (
                    <p className="text-center text-gray-600 animate-pulse">
                        Loading exams...
                    </p>
                ) : exams.length === 0 ? (
                    <p className="text-center text-gray-600">
                        No exams found for this semester.
                    </p>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-700">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700">
                                        <th className="px-4 py-3">Course Code</th>
                                        <th className="px-4 py-3">Course Name</th>
                                        <th className="px-4 py-3">Exam Date</th>
                                        <th className="px-4 py-3">Exam Time</th>
                                        <th className="px-4 py-3">Venue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams.map((exam) => (
                                        <tr
                                            key={exam.id}
                                            className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-semibold">
                                                {exam.courses?.course_code || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {exam.courses?.course_name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {formatDate(exam?.exam_date)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {formatTime(exam?.exam_time)}
                                            </td>
                                            <td className="px-4 py-3">{exam?.venue}</td>
                                        </tr>
                                    ))}                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {exams.map((exam) => (
                                <div
                                    key={exam.id}
                                    className="p-4 border rounded-lg shadow-sm bg-white"
                                >
                                    <h3 className="text-lg font-bold text-indigo-600">
                                        {exam.courses?.course_code}
                                    </h3>
                                    <p className="text-gray-700 font-medium mb-1">
                                        {exam.courses?.course_name}
                                    </p>
                                    <p className="text-gray-600">
                                        📅 {formatDate(exam?.exam_date)}
                                    </p>
                                    <p className="text-gray-600">
                                        ⏰ {formatTime(exam?.exam_time)}
                                    </p>
                                    <p className="text-gray-600">📍 {exam?.venue}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
