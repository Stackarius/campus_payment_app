import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function POST(req) {
  try {
    const { merchantID, amount, payerID } = await req.json();

    if (!merchantID || !amount || !payerID) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      return Response.json(
        { message: "Amount must be a positive number" },
        { status: 400 },
      );
    }

    console.log("=== MERCHANT PAYMENT INITIALIZATION ===");
    console.log("Insert data:", { merchantID, amount: amountFloat, payerID });

    // Fetch merchant info
    const { data: merchant, error: merchantError } = await supabase
      .from("merchants")
      .select("id, business_name")
      .eq("id", merchantID)
      .single();

    if (merchantError || !merchant) {
      return Response.json({ message: "Merchant not found" }, { status: 404 });
    }

    const merchantEmail =
      merchant.email ||
      `${merchant.business_name.replace(/\s+/g, "")}@example.com`;

    // Insert pending payment
    const { data: payment, error: insertError } = await supabase
      .from("merchant_payments")
      .insert({
        merchant_id: merchantID,
        payer_id: payerID,
        amount: amountFloat,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError || !payment) {
      return Response.json(
        {
          message: "Failed to create merchant payment",
          error: insertError?.message,
        },
        { status: 500 },
      );
    }

    // Server-generated reference
    const reference = `MERC-${payment.id}-${Date.now()}`;

    // Initialize Paystack transaction
    const paystackRes = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: merchantEmail,
        amount: Math.round(amountFloat * 100),
        currency: "NGN",
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        metadata: {
          payment_type: "merchant",
          merchant_id: merchantID,
          payer_id: payerID,
          merchant_reference: reference, // 🔑 important
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!paystackRes.data.status) {
      return Response.json(
        {
          message: "Paystack initialization failed",
          error: paystackRes.data.message,
        },
        { status: 500 },
      );
    }

    const initData = paystackRes.data.data;
    console.log("Paystack initialized:", initData);
    console.log("- Reference:", initData.reference);
    console.log("- Authorization URL:", initData.authorization_url);
    console.log("- Amount (kobo):", initData.amount);

    // Update DB with Paystack reference & auth URL
    await supabase
      .from("merchant_payments")
      .update({
        status: "success",
        reference: initData.reference,
        authorization_url: initData.authorization_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    return Response.json(
      {
        success: true,
        payment_id: payment.id,
        reference: initData.reference,
        authorization_url: initData.authorization_url,
        amount: amountFloat,
        currency: "NGN",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Merchant payment error:", error);
    return Response.json(
      { message: "Unexpected error occurred" },
      { status: 500 },
    );
  }
}
