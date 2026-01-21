'use client';
import { useState } from "react";

const SERVICE_TYPES = [
    "Printing Services",
    "Foods",
    "Transport",
    "Clothing",
    "Salon",
    "Stationery",
    "Snacks / Drinks",
];

export default function MerchantForm({ onClose, onMerchantAdded }) {
    const [fullname, setFullname] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
    const [accountNumber, setAccountNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/merchant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullname,
                    business_name: businessName,
                    service_type: serviceType,
                    account_no: accountNumber,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to add merchant');

            // pass new merchant back to parent to update list immediately
            if (onMerchantAdded) onMerchantAdded(data.merchant);

            // reset form
            setFullname('');
            setBusinessName('');
            setServiceType(SERVICE_TYPES[0]);
            setAccountNumber('');

            // close modal
            onClose();
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-lg p-6 relative shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>

                <h3 className="text-xl font-semibold mb-4">Add Merchant</h3>

                {errorMsg && (
                    <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{errorMsg}</div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Fullname"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        className="border p-2 w-full rounded"
                        required
                    />

                    <input
                        type="text"
                        placeholder="Business Name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="border p-2 w-full rounded"
                        required
                    />

                    <select
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="border p-2 w-full rounded"
                    >
                        {SERVICE_TYPES.map((service) => (
                            <option key={service} value={service}>
                                {service}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Account Number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="border p-2 w-full rounded"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-700 text-white w-full p-2 rounded font-semibold disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Merchant'}
                    </button>
                </form>
            </div>
        </div>
    );
}
