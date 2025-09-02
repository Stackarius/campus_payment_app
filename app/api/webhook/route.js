import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  // Get raw body as text
  const rawBody = await req.text();

  // Compute HMAC SHA512
  const computedHash = crypto
    .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const signature = req.headers.get("x-paystack-signature");

  // Debug logs
  console.log("Webhook Debug:");
  console.log("→ Raw Body:", rawBody);
  console.log("→ Computed Hash:", computedHash);
  console.log("→ Header Signature:", signature);

  if (computedHash !== signature) {
    console.error("❌ Invalid webhook signature – mismatch detected");
    return new Response(JSON.stringify({ message: "Invalid signature" }), {
      status: 400,
    });
  }

  // Parse event only after verifying signature
  const event = JSON.parse(rawBody);
  console.log("✅ Webhook event received:", event);

  if (event.event === "charge.success") {
    const { reference, status, gateway_response } = event.data;

    const { error } = await supabase
      .from("payments")
      .update({
        status: status === "success" ? "success" : "failed",
        gateway_response,
      })
      .eq("reference", reference)
      .eq("status", "pending");

    if (error) {
      console.error("❌ Supabase update error:", error);
    } else {
      console.log(
        `✅ Payment with reference ${reference} updated to ${status}`
      );
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
