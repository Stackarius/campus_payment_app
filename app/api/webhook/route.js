import { supabase } from "@/lib/supabaseClient";
import crypto from "crypto";

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    const expectedSignature = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(body, "utf8")
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("❌ Invalid Paystack signature");
      return new Response("Unauthorized", { status: 401 });
    }

    const event = JSON.parse(body);
    console.log("✅ Paystack event:", event.event);

    if (event.event === "charge.success") await handleSuccess(event.data);
    if (event.event === "charge.failed") await handleFailure(event.data);

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook crash:", err);
    return new Response("Server error", { status: 500 });
  }
}

/* ---------------- HANDLERS ---------------- */

async function handleSuccess(data) {
  const { id: paystackId, paid_at, metadata = {} } = data;
  const paymentType = metadata.payment_type ?? "student";

  if (paymentType === "merchant") {
    await updateMerchantPayment({ paystackId, paid_at, metadata, data });
  } else {
    await updateStudentPayment({
      paystackId,
      paid_at,
      data,
      reference: data.reference,
    });
  }
}

async function handleFailure(data) {
  const { id: paystackId, reference, metadata = {} } = data;
  const table =
    metadata.payment_type === "merchant" ? "merchant_payments" : "payments";

  await supabase
    .from(table)
    .update({
      status: "failed",
      transaction_reference: paystackId,
      gateway_response: data,
      updated_at: new Date().toISOString(),
    })
    .or(`transaction_reference.eq.${paystackId},reference.eq.${reference}`);
}

/* ---------------- STUDENT ---------------- */

async function updateStudentPayment({ reference, paystackId, paid_at, data }) {
  const { error } = await supabase
    .from("payments")
    .update({
      status: "success",
      paid_at,
      transaction_reference: paystackId,
      gateway_response: data,
      updated_at: new Date().toISOString(),
    })
    .eq("reference", reference);

  if (error) console.error("❌ Student payment update failed:", error);
}

/* ---------------- MERCHANT ---------------- */

async function updateMerchantPayment({ paystackId, paid_at, metadata, data }) {
  const merchantReference =
    metadata.merchant_reference ??
    metadata.custom_fields?.find(
      (f) => f.variable_name === "merchant_reference",
    )?.value;

  if (!merchantReference) {
    console.error("❌ Missing merchant_reference in metadata");
    return;
  }

  console.log("💰 Merchant payment details:", {
    paystackId,
    paid_at,
    merchantReference,
    data,
  });

  const { error } = await supabase
    .from("merchant_payments")
    .update({
      status: "success",
      paid_at,
      transaction_reference: paystackId,
      gateway_response: data,
      updated_at: new Date().toISOString(),
    })
    .eq("reference", merchantReference);

  if (error) console.error("❌ Merchant payment update failed:", error);
  else console.log("✅ Merchant payment settled:", merchantReference);
}
