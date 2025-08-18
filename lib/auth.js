import { supabase } from "./supabaseClient";

export const signup = async ({ email, password }) => {
  // 1. Sign up user
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error("Signup error:", error.message);
    return { user: null, error: error.message };
  }

  const user = data.user;

  // 2. Create profile (or update if exists)
  if (user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert([{ id: user.id, email }]); // upsert instead of insert

    if (profileError) {
      console.error("Profile insert error:", profileError.message);
      return { user, error: profileError.message };
    }
  }

  return { user, error: null };
};

export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!supabase) {
    console.error("Supabase client is not initialized.");
    return;
  }
  if (error) {
    console.log("Sign-in error:");
  }
  return data.user;
};

// Logout function
export const signOut = async () => {
  await supabase.auth.signOut();
};

// Password reset
export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail({
    email,
  });

  if (error) {
    toast("Error fetching user data at the moment....");
  }
  return data;
};

export const fetchRole = async (id) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    alert("Error fetching user");
    console.log(error.message);
  } else {
    return data;
  }
};
