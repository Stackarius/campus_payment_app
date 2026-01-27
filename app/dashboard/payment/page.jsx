'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-toastify';

export default function Payment() {
  const [form, setForm] = useState({ studentID: '', amount: '', type: '', full_name: '', merchantID: '', merchantItem: '' });
  const [paymentTarget, setPaymentTarget] = useState('student');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [activeProfile, setProfile] = useState('');
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [merchants, setMerchants] = useState([]);

  // Merchant-specific fixed items
  const getMerchantItems = (merchantId, serviceType) => {
    const items = {
      'f7125d88-70d0-422b-b6e9-10df55af0035': [ // Campus Print Hub
        { id: 'basic_print', name: 'Basic Printing (10 pages)', amount: 500, description: 'Black & white printing for documents' },
        { id: 'color_print', name: 'Color Printing (5 pages)', amount: 750, description: 'High-quality color printing' }
      ],
      '38984651-c2f7-4224-9769-b26986744e79': [ // Mama B Foods
        { id: 'regular_meal', name: 'Regular Meal', amount: 1500, description: 'Complete meal with rice and protein' },
        { id: 'snack_pack', name: 'Snack Pack', amount: 800, description: 'Assorted snacks and drinks' }
      ],
      '5a50922a-466d-46f7-89f7-b605f658b9dc': [ // CityRide Transport
        { id: 'campus_shuttle', name: 'Campus Shuttle (One Way)', amount: 300, description: 'Transport within campus' },
        { id: 'city_ride', name: 'City Ride (One Way)', amount: 800, description: 'Transport to city center' }
      ],
      '8a34a26b-195c-425f-be09-af07ae1ea944': [ // Zaria Styles
        { id: 'casual_wear', name: 'Casual Outfit', amount: 3500, description: 'Everyday casual clothing' },
        { id: 'traditional_attire', name: 'Traditional Attire', amount: 5000, description: 'Traditional Nigerian outfit' }
      ],
      'e9dd66d7-c90e-4fa4-8233-bcfe20cf40ff': [ // Glow Touch Salon
        { id: 'haircut', name: 'Haircut & Styling', amount: 2000, description: 'Professional haircut and styling' },
        { id: 'manicure', name: 'Manicure & Pedicure', amount: 2500, description: 'Complete nail care service' }
      ],
      '695cc3c6-e065-446b-8cb6-0c0db4bf5165': [ // Lawal Stationery Store
        { id: 'stationery_pack', name: 'Stationery Pack', amount: 1200, description: 'Notebooks, pens, and essentials' },
        { id: 'textbook', name: 'Textbook Rental', amount: 800, description: 'Monthly textbook rental' }
      ],
      'b7a83729-f3d0-460f-a054-59e69223dd8e': [ // QuickSip Drinks
        { id: 'drink_combo', name: 'Drink Combo', amount: 600, description: 'Assorted drinks pack' },
        { id: 'snack_box', name: 'Snack Box', amount: 900, description: 'Variety of snacks and drinks' }
      ],
      'de6732f0-7d6d-4381-b20e-adc06c36a78a': [ // PrintMore Express
        { id: 'express_print', name: 'Express Printing', amount: 1000, description: 'Fast printing service (1 hour)' },
        { id: 'binding', name: 'Document Binding', amount: 1500, description: 'Professional document binding' }
      ],
      '3e921989-668a-4398-abed-1b8014ee531b': [ // Campus Bites
        { id: 'lunch_special', name: 'Lunch Special', amount: 1200, description: 'Daily lunch special meal' },
        { id: 'breakfast_combo', name: 'Breakfast Combo', amount: 700, description: 'Breakfast meal with drink' }
      ],
      '3f2aa33a-2db6-4dfa-9f3e-b673b75f24a9': [ // Uni Stationery Hub
        { id: 'study_kit', name: 'Study Kit', amount: 1800, description: 'Complete study materials kit' },
        { id: 'art_supplies', name: 'Art Supplies', amount: 2200, description: 'Drawing and art materials' }
      ],
      '65fe31ee-6eb2-46dc-baac-807c2b7e0da0': [ // John's Closet
        { id: 't_shirt', name: 'Casual T-Shirt', amount: 2500, description: 'Quality casual t-shirt' },
        { id: 'jeans', name: 'Denim Jeans', amount: 4000, description: 'Comfortable denim jeans' }
      ]
    };

    return items[merchantId] || [];
  };

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
    } else if (paymentTarget === 'merchant' && form.merchantItem && form.merchantID) {
      const merchantItems = getMerchantItems(form.merchantID);
      const selected = merchantItems.find(item => item.id === form.merchantItem);
      if (selected) setForm(prev => ({ ...prev, amount: selected.amount }));
    } else if (paymentTarget === 'merchant') {
      setForm(prev => ({ ...prev, amount: '', merchantItem: '' }));
    }
  }, [form.type, form.merchantItem, form.merchantID, paymentTarget, paymentTypes]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (loading) return;

    const amountFloat = parseFloat(form.amount);
    if (isNaN(amountFloat) || amountFloat <= 0) return toast.warn("Invalid payment amount");
    if (paymentTarget === 'student' && !student_id) return toast.warn("Complete your profile before paying");
    if (paymentTarget === 'merchant' && !form.merchantID) return toast.warn("Select a merchant to pay");
    if (paymentTarget === 'merchant' && !form.merchantItem) return toast.warn("Select a service item");

    setLoading(true);
    try {
      const endpoint = paymentTarget === 'student' ? '/api/payment' : '/api/payment/merchant';
      const payload = paymentTarget === 'student'
        ? { studentID: student_id, amount: amountFloat, type: form.type, email: activeProfile.email, full_name: activeProfile.full_name }
        : { merchantID: form.merchantID, amount: amountFloat, payerID: userId, item: form.merchantItem };

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
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Select Merchant</option>
              {merchants.map(m => (
                <option key={m.id} value={m.id}>
                  {m.business_name} ({m.service_type})
                </option>
              ))}
            </select>

            {form.merchantID && (
              <>
                <select
                  value={form.merchantItem}
                  onChange={(e) => setForm(prev => ({ ...prev, merchantItem: e.target.value }))}
                  className="w-full p-2 border rounded mb-4"
                >
                  <option value="">Select Service</option>
                  {getMerchantItems(form.merchantID).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} - ₦{item.amount.toLocaleString()}
                    </option>
                  ))}
                </select>

                <div className="p-3 bg-gray-50 rounded mb-4">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Selected Service:</strong> {getMerchantItems(form.merchantID).find(item => item.id === form.merchantItem)?.name || 'None'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Description:</strong> {getMerchantItems(form.merchantID).find(item => item.id === form.merchantItem)?.description || 'Select a service to see description'}
                  </p>
                </div>
              </>
            )}

            <input
              type="number"
              value={form.amount}
              readOnly
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
              placeholder="Amount will be auto-filled"
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
