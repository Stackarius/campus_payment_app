'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Registration() {
    const [form, setForm] = useState({ type: 'course', semester: '1', course: '', details: '', status: 'pending' });
    const [message, setMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchStudent = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('students')
                    .select('student_id')
                    .eq('id', user.id)
                    .single();
                if (error || !data) setMessage('Student not registered');
            }
        };
        fetchStudent();
    }, []);

    // Hardcoded course list per semester
    const coursesBySemester = {
        '1': ['CS101 - Intro to Programming', 'MA101 - Calculus I', 'PH101 - Physics I'],
        '2': ['CS201 - Data Structures', 'MA201 - Linear Algebra', 'CH201 - Chemistry II'],
        '3': ['CS301 - Algorithms', 'MA301 - Probability', 'EE301 - Circuits'],
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setMessage('Please log in');
            return;
        }

        if (form.type === 'course' && !form.course) {
            setMessage('Please select a course');
            return;
        }

        // TODO: create registrations table in db

        const { error } = await supabase
            .from('registrations')
            .insert({
                student_id: user.id,
                type: form.type,
                details: { description: form.details || form.course },
                status: form.status,
            });
        if (error) setMessage(error.message);
        else {
            setMessage(`Registration for ${form.type} submitted`);
            router.push('/dashboard');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-4">
            <h1 className="text-2xl font-bold mb-4">Student Registration</h1>
            {message && <p className="text-red-500 mb-4">{message}</p>}
            <form onSubmit={handleRegister} className="space-y-4">
                <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full p-2 border rounded"
                >
                    <option value="course">Course Registration</option>
                    <option value="exams">Exams</option>
                    <option value="timetable">Timetable</option>
                </select>
                {form.type === 'course' && (
                    <>
                        <select
                            value={form.semester}
                            onChange={(e) => setForm({ ...form, semester: e.target.value })}
                            className="w-full p-2 border rounded"
                        >
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                            <option value="3">Semester 3</option>
                        </select>
                        <select
                            value={form.course}
                            onChange={(e) => setForm({ ...form, course: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                        >
                            <option value="">Select a Course</option>
                            {coursesBySemester[form.semester].map((course) => (
                                <option key={course} value={course}>
                                    {course}
                                </option>
                            ))}
                        </select>
                    </>
                )}
                {form.type !== 'course' && (
                    <textarea
                        placeholder="Details (e.g., exam ID, timetable notes)"
                        value={form.details}
                        onChange={(e) => setForm({ ...form, details: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    />
                )}
                <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
                    Submit Registration
                </button>
            </form>
        </div>
    );
}