import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const {
      data: payments,
      error,
      count,
    } = await supabase
      .from("merchant_payments")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return Response.json(
        { message: "Failed to fetch merchant payments" },
        { status: 500 },
      );
    }

    return Response.json({
      payments,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
      },
    });
  } catch (err) {
    console.error("Merchant payment fetch error:", err);
    return Response.json(
      { message: "Unexpected server error" },
      { status: 500 },
    );
  }
}
