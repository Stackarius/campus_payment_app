import { supabase } from "@/lib/supabaseClient";

import crypto from "crypto";

export async function POST(req) {
  try {
    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // console.log("Webhook received:");
    // console.log("- Body length:", body.length);
    // console.log("- Signature received:", signature);
    // console.log("- Secret key exists:", !!process.env.PAYSTACK_SECRET_KEY);

    // Verify the webhook signature
    const expectedSignature = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(body, "utf8")
      .digest("hex");

    // console.log("- Expected signature:", expectedSignature);

    if (signature !== expectedSignature) {
      // console.error("Invalid webhook signature");
      // console.error("Received:", signature);
      // console.error("Expected:", expectedSignature);
      return new Response("Unauthorized", { status: 401 });
    }

    const event = JSON.parse(body);

    console.log("Paystack webhook received:", event.event);

    // Log the full payload to understand what we're getting
    // console.log("=== FULL PAYSTACK PAYLOAD ===");
    // console.log(JSON.stringify(event.data, null, 2));

    // Handle different webhook events
    switch (event.event) {
      case "charge.success":
        await handleSuccessfulPayment(event.data);
        break;

      case "charge.failed":
        await handleFailedPayment(event.data);
        break;

      case "subscription.create":
        // Handle subscription creation if needed
        break;

      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function handleSuccessfulPayment(paymentData) {
  try {
    const {
      reference: rawReference,
      id: transaction_id,
      amount,
      customer,
      metadata,
      paid_at,
    } = paymentData;

    const reference = rawReference?.trim() || rawReference;

    // console.log(`=== DEBUGGING PAYMENT LOOKUP ===`);
    // console.log(`Raw reference from Paystack: "${rawReference}"`);
    // console.log(`Trimmed reference: "${reference}"`);
    // console.log(`Transaction ID: ${transaction_id}`);
    // console.log(`Reference length: ${reference?.length}`);
    // console.log(`Reference type: ${typeof reference}`);

    // First, let's see ALL payments in the database for comparison
    const { data: allPayments, error: fetchError } = await supabase
      .from("payments")
      .select("id, reference, transaction_reference, status, student_id")
      .order("created_at", { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error("Error fetching payments for debug:", fetchError);
    } else {
      console.log("=== ALL RECENT PAYMENTS IN DB ===");
      allPayments.forEach((payment) => {
        console.log(
          `ID: ${payment.id}, Ref: "${payment.reference}", TxnRef: "${payment.transaction_reference}", Status: ${payment.status}`
        );
        console.log(
          `Reference match: "${payment.reference}" === "${reference}" = ${
            payment.reference === reference
          }`
        );
        console.log(
          `Transaction match: "${
            payment.transaction_reference
          }" === "${transaction_id}" = ${
            payment.transaction_reference == transaction_id
          }`
        );
      });
    }

    console.log(`\n=== ATTEMPTING UPDATE ===`);

    // Let's first try a direct select to make sure we can find the payment
    console.log(`Testing direct select with reference: "${reference}"`);
    const { data: testSelect, error: testError } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference);

    // console.log("Direct select result:");
    // console.log("- Found payments:", testSelect?.length || 0);
    // console.log("- Error:", testError);
    if (testSelect && testSelect.length > 0) {
      console.log("- First payment:", testSelect[0]);
    }

    let updateResult = null;
    let updateError = null;

    // Strategy 1: Try to update using reference first
    console.log(`Attempting to update using reference: "${reference}"`);
    const { data: refData, error: refError } = await supabase
      .from("payments")
      .update({
        status: "success",
        paid_at: paid_at,
        transaction_reference: transaction_id, // Store transaction ID if missing
        gateway_response: JSON.stringify(paymentData),
        updated_at: new Date().toISOString(),
      })
      .eq("reference", reference)
      .select();

    if (refError) {
      updateError = refError;
    }

    if (refData && refData.length > 0) {
      console.log(` Payment found and updated using reference: "${reference}"`);
      console.log("Updated payment:", refData[0]);
      updateResult = refData;
    } else {
      console.log(` No rows affected by update with reference: "${reference}"`);

      // Let's try a simple update without all the fields to test
      console.log("Trying simplified update...");
      const { data: simpleUpdate, error: simpleError } = await supabase
        .from("payments")
        .update({ status: "success" })
        .eq("reference", reference)
        .select();

      // console.log("Simple update result:");
      // console.log("- Data:", simpleUpdate);
      // console.log("- Error:", simpleError);

      if (simpleUpdate && simpleUpdate.length > 0) {
        console.log(" Simple update worked! Issue is with the update payload");
        updateResult = simpleUpdate;
      } else if (!simpleError) {
        // No error but no data - this means the WHERE clause didn't match
        console.log(" WHERE clause didn't match any records");

        // Let's check if there are ANY payments we can update (sanity check)
        const { data: anyUpdate, error: anyError } = await supabase
          .from("payments")
          .select("id, reference")
          .limit(1);

        if (anyUpdate && anyUpdate.length > 0) {
          console.log(" Can read from payments table:", anyUpdate[0]);

          // Try updating that payment to test permissions
          const { data: testUpdate, error: testError } = await supabase
            .from("payments")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", anyUpdate[0].id)
            .select();

          console.log("Permission test result:");
          console.log("- Can update:", testUpdate?.length > 0);
          console.log("- Error:", testError);
        }
      }

      updateError = simpleError || refError;
    }

    if (updateError) {
      console.error("Error updating payment status:", updateError);
      return;
    }

    if (updateResult && updateResult.length > 0) {
      console.log(" Payment successfully marked as completed");
      console.log("Updated payment data:", updateResult[0]);
      await handlePostPaymentActions(updateResult[0]);
    } else {
      console.warn(
        ` No payment found with either reference: "${reference}" or transaction_id: ${transaction_id}`
      );

      // Try a broader search for debugging
      const { data: similarPayments } = await supabase
        .from("payments")
        .select("id, reference, transaction_reference, status")
        .or(
          `reference.ilike.%${
            reference?.substring(1, -1) || ""
          }%,transaction_reference.eq.${transaction_id}`
        );

      if (similarPayments && similarPayments.length > 0) {
        console.log(" Similar payments found:");
        similarPayments.forEach((p) =>
          console.log(
            `- Ref: "${p.reference}", TxnRef: "${p.transaction_reference}", Status: ${p.status}`
          )
        );
      }
    }
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}

async function handleFailedPayment(paymentData) {
  try {
    const { reference: rawReference, id: transaction_id } = paymentData;
    const reference = rawReference?.trim() || rawReference;

    // console.log(`=== HANDLING FAILED PAYMENT ===`);
    // console.log(`Raw reference: "${rawReference}"`);
    // console.log(`Trimmed reference: "${reference}"`);
    // console.log(`Transaction ID: ${transaction_id}`);

    let updateResult = null;
    let updateError = null;

    // Strategy 1: Try reference first
    const { data: refData, error: refError } = await supabase
      .from("payments")
      .update({
        status: "failed",
        transaction_reference: transaction_id, // Store transaction ID if missing
        gateway_response: JSON.stringify(paymentData),
        updated_at: new Date().toISOString(),
      })
      .eq("reference", reference)
      .select();

    if (refData && refData.length > 0) {
      updateResult = refData;
    } else if (transaction_id) {
      // Strategy 2: Try transaction_reference
      const { data: txnData, error: txnError } = await supabase
        .from("payments")
        .update({
          status: "failed",
          reference: reference, // Update reference if missing
          gateway_response: JSON.stringify(paymentData),
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_reference", transaction_id)
        .select();

      updateResult = txnData;
      updateError = txnError || refError;
    } else {
      updateError = refError;
    }

    if (updateError) {
      console.error("Error updating failed payment:", updateError);
    } else if (updateResult && updateResult.length > 0) {
      console.log(` Payment marked as failed`);
    } else {
      console.warn(` No payment found to mark as failed`);
    }
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}
