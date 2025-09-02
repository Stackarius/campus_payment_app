import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization"), // token from frontend
        },
      },
    }
  );

  // 1 Get logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  //  Fetch profile to get student_id (matric no)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("student_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const studentId = profile.student_id;

  //  Pagination
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const fromIndex = (page - 1) * limit;
  const toIndex = fromIndex + limit - 1;

  //  Fetch only this student’s payments
  let query = supabase
    .from("payments")
    .select("*", { count: "exact" })
    .eq("student_id", studentId)
    .range(fromIndex, toIndex);

  const { data, error: queryError, count } = await query;

  if (queryError) {
    return Response.json({ error: queryError.message }, { status: 500 });
  }

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
