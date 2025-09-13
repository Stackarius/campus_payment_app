// app/api/payments/route.js
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { studentID, amount, type, email } = await req.json();

    console.log("=== PAYMENT INITIALIZATION ===");
    console.log("Insert data:", { studentID, amount, type, email });

    // Validate required fields
    if (!studentID || !amount || !type || !email) {
      console.error("Missing required fields:", {
        studentID,
        amount,
        type,
        email,
      });
      return Response.json(
        {
          message:
            "Missing required fields: studentID, amount, type, email are all required",
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      console.error("Invalid amount:", amount);
      return Response.json(
        { message: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return Response.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    console.log(" Validation passed, initializing Paystack transaction...");

    // Initialize Paystack transaction
    const paystackPayload = {
      email,
      amount: Math.round(amount * 100), // Convert to kobo
      currency: "NGN",
      metadata: {
        student_id: studentID,
        payment_type: type,
        email,
        source: "student_portal",
      },
      callback_url: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/test-payment/`
        : undefined,
    };

    console.log("Paystack payload:", paystackPayload);

    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      paystackPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      }
    );

    if (!paystackResponse.data.status) {
      console.error("Paystack initialization failed:", paystackResponse.data);
      return Response.json(
        { message: "Payment initialization failed. Please try again." },
        { status: 500 }
      );
    }

    const initData = paystackResponse.data.data;
    console.log(" Paystack response received:");
    console.log("- Reference:", initData.reference);
    console.log("- Access code:", initData.access_code);
    console.log(
      "- Authorization URL length:",
      initData.authorization_url?.length
    );

    // Prepare payment data for database
    const paymentData = {
      student_id: studentID,
      amount: parseFloat(amount), // Ensure it's stored as a number
      type: type.trim(),
      email: email.trim().toLowerCase(),
      status: "pending",
      reference: initData.reference?.trim(), // Paystack's reference
      transaction_reference: null, // Will be populated by webhook
      authorization_url: initData.authorization_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Inserting payment into database:", paymentData);

    // Insert into payments table
    const { data: insertedPayment, error: insertError } = await supabase
      .from("payments")
      .insert(paymentData)
      .select()
      .single();

    if (insertError) {
      console.error(" Supabase insert error:", insertError);

      // Try to provide more specific error messages
      if (insertError.code === "23505") {
        // Unique constraint violation
        return Response.json(
          { message: "Payment with this reference already exists" },
          { status: 409 }
        );
      } else if (insertError.code === "23503") {
        // Foreign key violation
        return Response.json(
          { message: "Invalid student ID provided" },
          { status: 400 }
        );
      } else {
        return Response.json(
          { message: `Database error: ${insertError.message}` },
          { status: 500 }
        );
      }
    }

    console.log(" Payment record created successfully:");
    console.log("- Database ID:", insertedPayment.id);
    console.log("- Reference:", insertedPayment.reference);
    console.log("- Status:", insertedPayment.status);

    // Return success response
    const responseData = {
      success: true,
      payment_id: insertedPayment.id,
      reference: initData.reference,
      authorization_url: initData.authorization_url,
      amount: amount,
      currency: "NGN",
    };

    console.log(" Payment initialization completed successfully");
    return Response.json(responseData, { status: 201 });
  } catch (error) {
    console.error(" Payment initialization error:", error);

    // Handle specific error types
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return Response.json(
        { message: "Unable to connect to payment service. Please try again." },
        { status: 503 }
      );
    } else if (error.response?.status === 401) {
      console.error("Paystack authentication failed - check secret key");
      return Response.json(
        { message: "Payment service configuration error" },
        { status: 500 }
      );
    } else if (error.response?.status >= 400 && error.response?.status < 500) {
      console.error("Paystack client error:", error.response.data);
      return Response.json(
        { message: error.response.data?.message || "Invalid payment request" },
        { status: 400 }
      );
    } else {
      return Response.json(
        { message: "An unexpected error occurred. Please try again." },
        { status: 500 }
      );
    }
  }
}

export async function GET() {
  try {
    // Health check endpoint
    const { data, error } = await supabase
      .from("payments")
      .select("count", { count: "exact" })
      .limit(1);

    if (error) {
      console.error("Database health check failed:", error);
      return Response.json(
        {
          message: "Payment API - Database connection failed",
          status: "unhealthy",
        },
        { status: 503 }
      );
    }

    return Response.json(
      {
        message: "Payment API is running",
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check error:", error);
    return Response.json(
      {
        message: "Payment API - Health check failed",
        status: "unhealthy",
      },
      { status: 500 }
    );
  }
}

// Optional: Handle other HTTP methods
export async function PUT() {
  return Response.json(
    { message: "Method not allowed. Use POST to create payments." },
    { status: 405 }
  );
}

export async function DELETE() {
  return Response.json(
    { message: "Method not allowed. Use POST to create payments." },
    { status: 405 }
  );
}
