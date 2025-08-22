import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const studentID = searchParams.get("studentID");

  const from = searchParams.get("from"); // e.g. 2025-01-01
  const to = searchParams.get("to");

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const fromIndex = (page - 1) * limit;
  const toIndex = fromIndex + limit - 1;

  let query = supabase.from("payments").select("*", { count: "exact" });
  // filter by student id
  if (studentID) {
    query = query.eq("studentID", studentID);
  }

  // Filter by date
  if (from) {
    query = query.gte("created_at", from);
  }
  if (to) {
    query = query.lte("created_at", to);
  }

  // Apply Pagination
  query = query.range(fromIndex, toIndex);

  const { data, error, count } = await query;

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({
    payments: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
}
