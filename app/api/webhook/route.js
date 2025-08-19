import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const sig = req.headers.get("x-paystack-signature");
  if (!sig || process.env.PAYSTACK_WEBHOOK_SECRET !== sig) {
    return new Response(JSON.stringify({ message: "Invalid signature" }), {
      status: 400,
    });
  }

  const event = await req.json();
  if (event.event === "charge.success") {
    const { data, error } = await supabase
      .from("payments")
      .update({ status: "success" })
      .eq("student_id", event.data.metadata.student_id)
      .eq("status", "pending"); // Only update if still pending
    if (error) console.error(error);
  }
  return new Response(JSON.stringify({ received: true }), { status: 200 });
}

export async function GET() {
  return new Response(JSON.stringify({ message: "Method not allowed" }), {
    status: 405,
  });
}
