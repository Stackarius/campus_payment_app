'use client'

import { useState, useEffect } from 'react';
import PaystackButton from '@/components/PaystackButton';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-toastify';

export default function Payment() {
  const [form, setForm] = useState({ studentID: '', amount: '', type: 'tuition' });
    const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('')
  const [activeprofile, setProfile] = useState('')

  const student_id = activeprofile?.student_id

    const handleSubmit = (e) => {
        e.preventDefault()

    }

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          toast.error("Please log in to view your profile");
          return;
        }
        setUserId(userData.user.id);

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.user.id)
          .single();

        if (profileError) {
          toast.error(`Failed to fetch profile: ${profileError.message}`);
          console.error("Supabase profile error:", profileError);
          return;
        }

        if (profileData) {
          setProfile(profileData);
        } else {
          toast.warn("No profile found. Please complete your registration.");
        }
      } catch (err) {
        toast.error("Unexpected error fetching profile");
        console.error("Unexpected error:", err);
      } 
    };

    fetchDetails();
  }, []);

  return (
    <>
      <div className="max-w-md mx-auto mt-10 p-4">
        <h1 className="text-2xl font-bold mb-4">Payment Portal</h1>
        {message && <p className="text-red-500 mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Full Name:</span>
              <span className="text-gray-800">{activeprofile.full_name || "Not set"}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Email:</span>
              <span className="text-gray-800">{activeprofile.email || "Not set"}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Matric No:</span>
              <span className="text-gray-800">{student_id || "Not set"}</span>
            </div>

          </div>
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
          <PaystackButton  email={activeprofile.email} amount={form.amount} studentID={student_id} type={form.type}/>
        </form>
      </div>
    </>
  );
}