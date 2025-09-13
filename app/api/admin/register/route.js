import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  const { email, password, staffID } = await req.json();

  // Validation - all fields required for registration
  if (!email || !password || !staffID) {
    return new Response(
      JSON.stringify({
        message:
          "Email, password, and staff ID are required for admin registration",
      }),
      { status: 400 }
    );
  }

  try {
    // Check if staff ID already exists in profiles table
    const { data: existingStaff, error: checkError } = await supabase
      .from("profiles")
      .select("staff_id")
      .eq("staff_id", staffID)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 means no rows found
      return new Response(
        JSON.stringify({ message: "Error checking staff ID availability" }),
        { status: 500 }
      );
    }

    if (existingStaff) {
      return new Response(
        JSON.stringify({ message: "Staff ID already exists" }),
        { status: 400 }
      );
    }

    // Sign up the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          staffID: staffID,
          role: "admin",
        },
      },
    });

    if (error) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: 400,
      });
    }

    if (!data.user) {
      return new Response(
        JSON.stringify({ message: "User registration failed" }),
        { status: 500 }
      );
    }

    // Insert user into profiles table with correct field names
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        email,
        user_role: "admin",
        staff_id: staffID, // Use staff_id instead of matric_no
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("Profile creation error:", profileError);

      // If profile creation fails, we should clean up the auth user
      // though this is tricky with Supabase's current API
      return new Response(
        JSON.stringify({
          message: "Admin profile creation failed. Please contact support.",
          error: profileError.message,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        message:
          "Admin registered successfully. Please check your email to verify your account.",
        user: {
          id: data.user.id,
          email: data.user.email,
          staffID: staffID,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error during registration" }),
      { status: 500 }
    );
  }
}
