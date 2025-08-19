import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const { studentID, amount, type, email } = await req.json();
  console.log("Paystack Key:", process.env.NEXT_PUBLIC_PAYSTACK_KEY);
  console.log("Insert data:", { studentID, amount, type, email });
  if (!studentID || !amount || !type) {
    return new Response(
      JSON.stringify({ message: "Missing required fields" }),
      { status: 400 }
    );
  }
  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: email,
        amount: Math.round(amount * 100),
        currency: "NGN",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_KEY}`,
        },
      }
      );

      const initialStatus =
          response.data.status === "success" ? "success" : "pending";
      
    const { data, error } = await supabase
      .from("payments")
      .insert({ student_id: studentID, amount, status: initialStatus, type });
    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Database insertion failed: ${error.message}`);
    }
    return new Response(
      JSON.stringify({
        authorization_url: response.data.data.authorization_url,
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
