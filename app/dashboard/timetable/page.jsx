"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function Timetable() {
    const [semester, setSemester] = useState(1);
    const [profileId, setProfileId] = useState(null);
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTimetable = async (id) => {
        setLoading(true);

        // 1. Get registered courses
        const { data: registrations, error: regError } = await supabase
            .from("registrations")
            .select("course_id")
            .eq("profile_id", id)
            .eq("semester", semester);

        if (regError) {
            toast.error("Error fetching registrations");
            console.error("Error fetching registrations:", regError.message);
            setLoading(false);
            return;
        }

        if (!registrations || registrations.length === 0) {
            setTimetable([]);
            setLoading(false);
            return;
        }

        const courseIds = registrations.map((r) => r.course_id);

        // 2. Get timetable slots
        const { data: timetableData, error: timetableError } = await supabase
            .from("timetable")
            .select(`
        id,
        day_of_week,
        start_time,
        end_time,
        venue,
        semester,
        courses (course_code, course_name)
      `)
            .in("course_id", courseIds)
            .eq("semester", semester);

        if (timetableError) {
            setTimetable([])
            console.error("Error fetching timetable:", timetableError.message);
            setLoading(false);
            return;
        }

        setTimetable(timetableData);
        setLoading(false);
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (profileId) {
            fetchTimetable(profileId);
        }
    }, [profileId, semester]);

    const fetchProfile = async () => {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            setLoading(false)
            console.error("Error fetching user:", userError?.message);
            return;
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single();

        if (profileError) {
            setLoading(false)
            console.error("Error fetching profile:", profileError.message);
            return;
        }

        setProfileId(profile.id);
    };


    // Days for ordering

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Class Timetable</h2>

            {/* Semester toggle */}
            <label htmlFor="semester-select" className="block mb-2 font-medium">
                Select Semester:
            </label>
            <select
                className="border rounded p-2 mb-4"
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
            >
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
            </select>

            {loading ? (
                <p>Loading...</p>
            ) : timetable.length === 0 ? (
                <p>No timetable found for this semester.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daysOfWeek.map((day) => {
                        const slots = timetable
                            .filter((slot) => slot.day_of_week === day)
                            .sort((a, b) => a.start_time.localeCompare(b.start_time));
                        return (
                            <div key={day} className="border rounded p-3 shadow-sm">
                                <h3 className="font-semibold text-lg mb-2">{day}</h3>
                                {slots.length === 0 ? (
                                    <p className="text-sm text-gray-500">No classes</p>
                                ) : (
                                    <ul>
                                        {slots.map((slot) => (
                                            <li
                                                key={slot.id}
                                                className="mb-3 p-2 border rounded bg-gray-50"
                                            >
                                                <strong>{slot.courses?.course_code || "N/A"}</strong> -{" "}
                                                {slot.courses?.course_name || "N/A"}
                                                <br />
                                                {slot.start_time} – {slot.end_time} @ {slot.venue}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
