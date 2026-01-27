'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-toastify';

export default function Payment() {
  const [form, setForm] = useState({ studentID: '', amount: '', type: '', full_name: '', merchantID: '' });
  const [paymentTarget, setPaymentTarget] = useState('student');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [activeProfile, setProfile] = useState('');
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [merchants, setMerchants] = useState([]);

  const student_id = activeProfile?.student_id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) return toast.error("Please log in to view your profile");
        setUserId(userData.user.id);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.user.id)
          .single();

        if (profileError) return toast.error(`Failed to fetch profile: ${profileError.message}`);
        if (profileData) setProfile(profileData);
      } catch (err) {
        console.error(err);
        toast.error("Unexpected error fetching profile");
      } finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchPaymentTypes = async () => {
      try {
        const { data, error } = await supabase.from("fees").select("name, amount");
        if (error) return toast.error(`Failed to fetch payment types: ${error.message}`);
        if (data?.length) setPaymentTypes(data);
      } catch (err) { console.error(err); }
    };
    fetchPaymentTypes();
  }, []);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const { data, error } = await supabase.from('merchants').select('id, business_name, service_type');
        if (error) return toast.error(`Failed to fetch merchants: ${error.message}`);
        setMerchants(data || []);
      } catch (err) { console.error(err); }
    };
    fetchMerchants();
  }, []);

  useEffect(() => {
    if (paymentTarget === 'student' && form.type && paymentTypes.length) {
      const selected = paymentTypes.find(p => p.name === form.type);
      if (selected) setForm(prev => ({ ...prev, amount: selected.amount }));
    } else if (paymentTarget === 'merchant') {
      setForm(prev => ({ ...prev, amount: '' }));
    }
  }, [form.type, paymentTarget]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (loading) return;

    const amountFloat = parseFloat(form.amount);
    if (isNaN(amountFloat) || amountFloat <= 0) return toast.warn("Invalid payment amount");
    if (paymentTarget === 'student' && !student_id) return toast.warn("Complete your profile before paying");
    if (paymentTarget === 'merchant' && !form.merchantID) return toast.warn("Select a merchant to pay");

    setLoading(true);
    try {
      const endpoint = paymentTarget === 'student' ? '/api/payment' : '/api/payment/merchant';
      const payload = paymentTarget === 'student'
        ? { studentID: student_id, amount: amountFloat, type: form.type, email: activeProfile.email, full_name: activeProfile.full_name }
        : { merchantID: form.merchantID, amount: amountFloat, payerID: userId };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!data?.authorization_url) return toast.error(data.message || "Payment initialization failed");

      window.open(data.authorization_url, '_blank');
      toast.success("Payment initialized! Complete it in the new tab.");
    } catch (err) {
      console.error(err);
      toast.error("Payment initialization failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Portal</h1>

      <select
        value={paymentTarget}
        onChange={(e) => setPaymentTarget(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="student">Student Payment</option>
        <option value="merchant">Merchant Payment</option>
      </select>

      <form onSubmit={handlePayment} className="space-y-4">
        {paymentTarget === 'student' && (
          <>
            <select
              value={form.type}
              onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full p-2 border rounded"
            >
              {paymentTypes.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>

            <input
              type="number"
              value={form.amount}
              readOnly
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
            />
          </>
        )}

        {paymentTarget === 'merchant' && (
          <>
            <select
              value={form.merchantID}
              onChange={(e) => setForm(prev => ({ ...prev, merchantID: e.target.value }))}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Merchant</option>
              {merchants.map(m => (
                <option key={m.id} value={m.id}>
                  {m.business_name} ({m.service_type})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Amount (NGN)"
              value={form.amount}
              onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </>
        )}

        <button
          type="submit"
          className="w-full p-2 border rounded bg-blue-500 text-white"
        >
          {loading ? "Processing..." : "Pay with Paystack"}
        </button>
      </form>
    </div>
  );
}
