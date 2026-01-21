import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { fullname, business_name, service_type, account_no } = body;

    // validate fields
    if (!fullname || !business_name || !service_type || !account_no) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data: insertData, error: insertError } = await supabase
      .from("merchants")
      .insert({ fullname, business_name, service_type, account_no })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { message: "Merchant already exists" },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { message: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Success", merchant: insertData },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
