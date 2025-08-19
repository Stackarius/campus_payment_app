'use client'

import { useState, useEffect } from 'react';
import PaystackButton from '@/components/PaystackButton';
import { supabase } from '@/lib/supabaseClient';

export default function Payment() {
  const [form, setForm] = useState({ studentID: '', amount: '', type: 'tuition' });
    const [message, setMessage] = useState('');
    const [user, setUser] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()

    }

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser()
            
            if (error) {
                return error.message
            }
            setUser(data.user.email)
            return
        } 

        fetchUser()
    }, [])

  return (
    <>
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
          <PaystackButton  email={user} amount={form.amount} studentID={form.studentID} type={form.type}/>
        </form>
      </div>
    </>
  );
}