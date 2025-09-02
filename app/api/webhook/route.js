import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const rawBody = await req.text();
  const sig = req.headers.get("x-paystack-signature");

  // Verify Paystack webhook signature
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (hash !== sig) {
    console.error("Invalid webhook signature");
    return new Response(JSON.stringify({ message: "Invalid signature" }), {
      status: 400,
    });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const { reference, status, gateway_response } = event.data;

    // Update payments table by reference
    const { error } = await supabase
      .from("payments")
      .update({
        status: status === "success" ? "success" : "failed",
        gateway_response,
      })
      .eq("reference", reference)
      .eq("status", "pending"); // Only update if still pending

    if (error) {
      console.error("Supabase update error:", error);
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}

export async function GET() {
  return new Response(JSON.stringify({ message: "Method not allowed" }), {
    status: 405,
  });
}
