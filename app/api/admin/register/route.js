import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { email, password, role } = await req.json()
    
    if (!email || !password || !role) {
        return new Response(JSON.stringify({message: 'All fields are required'}), {status: 400})
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role } }, // store the role in user's metadata
    });

    if (error) {
        return new Response(JSON.stringify({message: error.message}), {status: 400})
    }

    // link to admin table
    const { error: adminError } = await supabase.from("admin").insert({ id: data.user.id, role })
    
    if (adminError) {
        return new Response(JSON.stringify({message: "Signup failed, admin role not assigned"}), {status: 500})
    }
    return new Response(JSON.stringify({message: "Sign up successful"}), {status: 200})
}