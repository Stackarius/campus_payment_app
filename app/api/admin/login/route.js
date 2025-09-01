import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return new Response(
      JSON.stringify({ message: "Email and password are required" }),
      { status: 400 }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 400,
    });
  }

  // Fetch profile to verify admin role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_role")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    return new Response(JSON.stringify({ message: "Profile not found" }), {
      status: 404,
    });
  }

  if (!["admin", "super_admin"].includes(profile.user_role)) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 403,
    });
  }

  return new Response(
    JSON.stringify({
      message: "Login successful",
      user: { id: data.user.id, role: profile.user_role },
    }),
    { status: 200 }
  );
}
