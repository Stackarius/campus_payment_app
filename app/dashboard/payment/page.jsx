'use client'

import { useState, useEffect } from 'react';
import PaystackButton from '@/components/PaystackButton';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-toastify';

export default function Payment() {
  const [form, setForm] = useState({ studentID: '', amount: '', type: '', full_name: ''});
  const [message, setMessage] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [userId, setUserId] = useState('');
  const [activeprofile, setProfile] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentTypes, setPaymentTypes] = useState([]); // store available types

  const student_id = activeprofile?.student_id;

  // Fetch user profile
  useEffect(() => {
    setLoading(true)
    const fetchDetails = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          toast.error("Please log in to view your profile");
          return;
        }
        setLoading(false)
        setUserId(userData.user.id);

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

  // Fetch all payment types once
  useEffect(() => {
    const fetchPaymentTypes = async () => {
      try {
        const { data, error } = await supabase
          .from("fees") // 
          .select("name, amount");

        if (error) {
          toast.error(`Failed to fetch payment types: ${error.message}`);
          return;
        }

        if (data?.length) {
          setPaymentTypes(data);
          // default first option
          setForm((prev) => ({ ...prev, type: data[0].name, amount: data[0].amount }));
        } else {
          toast.warn("No payment types available");
        }
      } catch (err) {
        toast.error("Unexpected error fetching payment types");
        console.error("Error fetching payment types:", err);
      }
    };

    fetchPaymentTypes();
  }, []);

  // Update amount when type changes
  useEffect(() => {
    if (!form.type || !paymentTypes.length) return;
    const selected = paymentTypes.find((p) => p.name === form.type);
    if (selected) {
      setForm((prev) => ({ ...prev, amount: selected.amount }));
    }
  }, [form.type, paymentTypes]);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!form.amount || form.amount < 100) {
      toast.warn("Invalid payment amount");
      return;
    }

    if(!student_id) {
      toast.warn("Please complete all profile registration!");
      setLoading(false);
      return;
    }

    // Proceed with payment processing

    try {
      setLoading(true);

      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentID: student_id,
          amount: form.amount,
          type: form.type,
          email: activeprofile.email,
          full_name: form.full_name
        })
      });
      const data = await res.json();

      if (data.authorization_url) {
        window.open(data.authorization_url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(`Payment initialization failed: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Portal</h1>
      {message && <p className="text-red-500 mb-4">{message}</p>}
      <form onSubmit={handlePayment} className="space-y-4">
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

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full p-2 border rounded"
        >
          {paymentTypes.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount (NGN)"
          value={form.amount}
          readOnly
          className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
        />

        
            <button type="submit"
              className="w-full p-2 border rounded bg-blue-500 text-white">
              {loading ? 'Processing...' : 'Pay with Paystack'}
            </button>
          
      </form>
    </div>
  );
}
