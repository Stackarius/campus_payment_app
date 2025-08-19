import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const { student_id, amount, type } = await req.json();
  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: `${student_id}@school.com`,
        amount: Math.round(amount * 100),
        currency: "NGN",
      },
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );
    const { data, error } = await supabase
      .from("payments")
      .insert({ student_id, amount, type });
    if (error) throw error;
    return new Response(
      JSON.stringify({
        authorization_url: response.data.data.authorization_url,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Payment initialization failed" }),
      { status: 500 }
    );
  }
}

export async function GET() {
  return new Response(JSON.stringify({ message: "Method not allowed" }), {
    status: 405,
  });
}
