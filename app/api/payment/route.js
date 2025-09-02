import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const { studentID, amount, type, email } = await req.json();
  console.log("Insert data:", { studentID, amount, type, email });

  if (!studentID || !amount || !type || !email) {
    return new Response(
      JSON.stringify({ message: "Missing required fields" }),
      { status: 400 }
    );
  }

  try {
    // Initialize Paystack transaction
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: Math.round(amount * 100), // kobo
        currency: "NGN",
        metadata: {
          student_id: studentID,
          type,
          email,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_KEY}`,
        },
      }
    );

    const initData = response.data.data;

    // Insert into payments table with "pending" status
    const { error } = await supabase.from("payments").insert({
      student_id: studentID,
      amount,
      type,
      email,
      status: "pending",
      reference: initData.reference, //  store reference for webhook update
    });

    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error(`Database insertion failed: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        authorization_url: initData.authorization_url,
        reference: initData.reference,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ message: "Method not allowed" }), {
    status: 405,
  });
}
