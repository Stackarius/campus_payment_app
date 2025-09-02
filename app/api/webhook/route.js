import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    // Verify Paystack signature
    const sig = req.headers.get("x-paystack-signature");
    if (!sig || sig !== process.env.PAYSTACK_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ message: "Invalid signature" }), {
        status: 400,
      });
    }

    const event = await req.json();

    // Handle only successful charges
    if (event.event === "charge.success") {
      const reference = event.data?.reference;

      if (!reference) {
        return new Response(
          JSON.stringify({ message: "No reference in payload" }),
          { status: 400 }
        );
      }

      // Update payment status if it's still pending
      const { data, error } = await supabase
        .from("payments")
        .update({ status: "success" })
        .eq("reference", reference)
        .eq("status", "pending");

      if (error) {
        console.error("Supabase update error:", error);
        return new Response(
          JSON.stringify({ message: "Database update failed" }),
          { status: 500 }
        );
      }

      console.log(`Payment with reference ${reference} marked as success.`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ message: "Method not allowed" }), {
    status: 405,
  });
}
