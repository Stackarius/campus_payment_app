import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function POST(req) {
  try {
    const { merchantID, amount, payerID, item } = await req.json();

    if (!merchantID || !amount || !payerID || !item) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      return Response.json(
        { message: "Amount must be a positive number" },
        { status: 400 },
      );
    }

    console.log("=== MERCHANT PAYMENT INITIALIZATION ===");
    console.log("Insert data:", { merchantID, amount: amountFloat, payerID, item });

    // Merchant-specific fixed items
    const merchantItems = {
      'f7125d88-70d0-422b-b6e9-10df55af0035': [ // Campus Print Hub
        { id: 'basic_print', name: 'Basic Printing (10 pages)', amount: 500 },
        { id: 'color_print', name: 'Color Printing (5 pages)', amount: 750 }
      ],
      '38984651-c2f7-4224-9769-b26986744e79': [ // Mama B Foods
        { id: 'regular_meal', name: 'Regular Meal', amount: 1500 },
        { id: 'snack_pack', name: 'Snack Pack', amount: 800 }
      ],
      '5a50922a-466d-46f7-89f7-b605f658b9dc': [ // CityRide Transport
        { id: 'campus_shuttle', name: 'Campus Shuttle (One Way)', amount: 300 },
        { id: 'city_ride', name: 'City Ride (One Way)', amount: 800 }
      ],
      '8a34a26b-195c-425f-be09-af07ae1ea944': [ // Zaria Styles
        { id: 'casual_wear', name: 'Casual Outfit', amount: 3500 },
        { id: 'traditional_attire', name: 'Traditional Attire', amount: 5000 }
      ],
      'e9dd66d7-c90e-4fa4-8233-bcfe20cf40ff': [ // Glow Touch Salon
        { id: 'haircut', name: 'Haircut & Styling', amount: 2000 },
        { id: 'manicure', name: 'Manicure & Pedicure', amount: 2500 }
      ],
      '695cc3c6-e065-446b-8cb6-0c0db4bf5165': [ // Lawal Stationery Store
        { id: 'stationery_pack', name: 'Stationery Pack', amount: 1200 },
        { id: 'textbook', name: 'Textbook Rental', amount: 800 }
      ],
      'b7a83729-f3d0-460f-a054-59e69223dd8e': [ // QuickSip Drinks
        { id: 'drink_combo', name: 'Drink Combo', amount: 600 },
        { id: 'snack_box', name: 'Snack Box', amount: 900 }
      ],
      'de6732f0-7d6d-4381-b20e-adc06c36a78a': [ // PrintMore Express
        { id: 'express_print', name: 'Express Printing', amount: 1000 },
        { id: 'binding', name: 'Document Binding', amount: 1500 }
      ],
      '3e921989-668a-4398-abed-1b8014ee531b': [ // Campus Bites
        { id: 'lunch_special', name: 'Lunch Special', amount: 1200 },
        { id: 'breakfast_combo', name: 'Breakfast Combo', amount: 700 }
      ],
      '3f2aa33a-2db6-4dfa-9f3e-b673b75f24a9': [ // Uni Stationery Hub
        { id: 'study_kit', name: 'Study Kit', amount: 1800 },
        { id: 'art_supplies', name: 'Art Supplies', amount: 2200 }
      ],
      '65fe31ee-6eb2-46dc-baac-807c2b7e0da0': [ // John's Closet
        { id: 't_shirt', name: 'Casual T-Shirt', amount: 2500 },
        { id: 'jeans', name: 'Denim Jeans', amount: 4000 }
      ]
    };

    // Validate the selected item
    const items = merchantItems[merchantID] || [];
    const selectedItem = items.find(merchantItem => merchantItem.id === item);
    if (!selectedItem) {
      return Response.json(
        { message: "Invalid service item selected for this merchant" },
        { status: 400 },
      );
    }

    // Verify amount matches the selected item
    if (amountFloat !== selectedItem.amount) {
      return Response.json(
        { message: "Amount does not match selected service price" },
        { status: 400 },
      );
    }

    // Fetch merchant info
    const { data: merchant, error: merchantError } = await supabase
      .from("merchants")
      .select("id, business_name")
      .eq("id", merchantID)
      .single();

    if (merchantError || !merchant) {
      return Response.json({ message: "Merchant not found" }, { status: 404 });
    }

    const merchantEmail =
      merchant.email ||
      `${merchant.business_name.replace(/\s+/g, "")}@example.com`;

    // Insert pending payment
    const { data: payment, error: insertError } = await supabase
      .from("merchant_payments")
      .insert({
        merchant_id: merchantID,
        payer_id: payerID,
        amount: amountFloat,
        item: selectedItem.name,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError || !payment) {
      return Response.json(
        {
          message: "Failed to create merchant payment",
          error: insertError?.message,
        },
        { status: 500 },
      );
    }

    // Server-generated reference
    const reference = `MERC-${payment.id}-${Date.now()}`;

    // Initialize Paystack transaction
    const paystackRes = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: merchantEmail,
        amount: Math.round(amountFloat * 100),
        currency: "NGN",
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        metadata: {
          payment_type: "merchant",
          merchant_id: merchantID,
          payer_id: payerID,
          merchant_reference: reference,
          item_id: item,
          item_name: selectedItem.name,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!paystackRes.data.status) {
      return Response.json(
        {
          message: "Paystack initialization failed",
          error: paystackRes.data.message,
        },
        { status: 500 },
      );
    }

    const initData = paystackRes.data.data;
    console.log("Paystack initialized:", initData);
    console.log("- Reference:", initData.reference);
    console.log("- Authorization URL:", initData.authorization_url);
    console.log("- Amount (kobo):", initData.amount);

    // Update DB with Paystack reference & auth URL
    await supabase
      .from("merchant_payments")
      .update({
        status: "success",
        reference: initData.reference,
        authorization_url: initData.authorization_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    return Response.json(
      {
        success: true,
        payment_id: payment.id,
        reference: initData.reference,
        authorization_url: initData.authorization_url,
        amount: amountFloat,
        currency: "NGN",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Merchant payment error:", error);
    return Response.json(
      { message: "Unexpected error occurred" },
      { status: 500 },
    );
  }
}
