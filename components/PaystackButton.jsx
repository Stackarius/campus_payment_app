"use client";

import { useState } from "react";

const PaystackButton = ({ email, amount, studentID, type }) => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (!email || !email.includes("@")) {
            alert("Please provide a valid email.");
            return;
        }

        if (!amount || amount <= 0) {
            alert("Amount must be greater than zero.");
            return;
        }

        setLoading(true);

        try {
            // Call API route
            const res = await fetch("/api/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({studentID, email, amount, type }),
            });

            const data = await res.json();

            if (data?.authorization_url) {
                // Redirect user to Paystack checkout page
                window.location.href = data.authorization_url;
            } else {
                alert("Failed to initialize payment. Try again.");
            }
        } catch (err) {
            console.error(err.message);
            alert("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            type="button"
            className="bg-blue-600 font-semibold text-md px-4 py-2 rounded text-white disabled:bg-gray-400"
        >
            {loading ? "Processing..." : "Pay Now"}
        </button>
    );
};

export default PaystackButton;
