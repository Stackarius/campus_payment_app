import { supabase } from "@/lib/supabaseClient"

export async function POST(req) {
    const { email, password } = await req.json()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
        return new Response(JSON.stringify({message: error.message}), {status: 400})
    }
    
    // check if user is admin
    const { data: adminData, error: adminError } = await supabase.from('admin').select('role').eq('id', data.user.id).single()
    if (adminError || !adminData) {
        return new Response(JSON.stringify({message: "Not an admin"}), {status: 403})
    }

    return new Response(JSON.stringify({message: "Login Succesful", user: data.user}), {status: 200})
}