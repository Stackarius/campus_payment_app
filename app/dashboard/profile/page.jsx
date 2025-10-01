'use client'

import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function ProfilePage() {
  const [userId, setUserId] = useState("")
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true)
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData?.user) {
          toast.error("Please log in to view your profile")
          return
        }
        setUserId(userData.user.id)

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, student_id, school, department, level, phone, sex, avatar_url")
          .eq("id", userData.user.id)
          .single()

        if (profileError) {
          toast.error(`Failed to fetch profile: ${profileError.message}`)
          console.error("Supabase profile error:", profileError)
          return
        }

        if (profileData) {
          setProfile(profileData)
        } else {
          toast.warn("No profile found. Please complete your registration.")
        }
      } catch (err) {
        toast.error("Unexpected error fetching profile")
        console.error("Unexpected error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-lg font-semibold text-gray-500">
          Loading profile...
        </div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-red-600">
          Please log in to view your profile.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center">
          <Image
            height={120}
            width={120}
            src={"/female_avatar.jpg"}
            alt="Profile"
            className="rounded-full w-[150px] h-[150px] object-cover border-4 border-blue-500 shadow-md"
          />
          <h2 className="mt-4 text-2xl font-bold text-gray-800">
            {profile?.full_name || "Not set"}
          </h2>
          <p className="text-gray-500 text-sm">{profile?.student_id || "Matric not set"}</p>
        </div>

        <div className="mt-8 space-y-4">
          {[
            ["School", profile?.school],
            ["Department", profile?.department],
            ["Level", profile?.level],
            ["Sex", profile?.sex ? profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1) : "Not set"],
            ["Phone", profile?.phone],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between items-center border-b pb-2 last:border-0"
            >
              <span className="text-gray-600 font-medium">{label}:</span>
              <span className="text-gray-800">{value || "Not set"}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => toast.info("Edit profile coming soon")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  )
}
