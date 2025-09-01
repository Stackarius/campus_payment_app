import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return new Response(
      JSON.stringify({ message: "Email and password are required" }),
      { status: 400 }
    );
  }

  // Sign up the user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 400,
    });
  }

  // Upsert user into profiles table
  const { error: profileError } = await supabase.from("profiles").upsert(
    { id: data.user.id, email, user_role: "admin" },
    { onConflict: "id" } // this ensures no duplicate primary key error
  );

  if (profileError) {
    return new Response(
      JSON.stringify({
        message: "Admin profile creation failed",
        profileError,
      }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({ message: "Admin registered successfully" }),
    { status: 200 }
  );
}
