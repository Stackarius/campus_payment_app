'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const PaystackPop = dynamic(() => import('@paystack/inline-js'), { ssr: false });

export default function Payment() {
    const [form, setForm] = useState({ studentID: '', amount: '', type: 'tuition' });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.studentID || !form.amount) {
            setMessage('Please fill all fields.');
            return;
        }
        const res = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok && PaystackPop) {
            const paystack = new PaystackPop();
            paystack.newTransaction({
                key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
                email: `${form.studentID}@school.com`,
                amount: form.amount * 100,
                metadata: { student_id: form.studentID },
                onSuccess() {
                    setMessage('Payment successful!');
                },
                onCancel() {
                    setMessage('Payment cancelled.');
                },
            });
        } else {
            setMessage('Error occurred.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-4">
            <h1 className="text-2xl font-bold mb-4">Payment Portal</h1>
            {message && <p className="text-red-500 mb-4">{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Student ID"
                    value={form.studentID}
                    onChange={(e) => setForm({ ...form, studentID: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                />
                <input
                    type="number"
                    placeholder="Amount (NGN)"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                />
                <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full p-2 border rounded"
                >
                    <option value="tuition">Tuition</option>
                    <option value="levy">Levy</option>
                </select>
                <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
                    Pay Now
                </button>
            </form>
        </div>
    );
}