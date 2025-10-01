'use client'

import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function ProfilePage() {
  const [userId, setUserId] = useState("")
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    student_id: "",
    school: "",
    department: "",
    level: "",
    phone: "",
    sex: "",
    avatar_url: "",
  })

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
          .select("*")
          .eq("id", userData.user.id)
          .single()

        if (profileError) {
          toast.error(`Failed to fetch profile: ${profileError.message}`)
          return
        }

        if (profileData) {
          setProfile(profileData)
          setFormData(profileData) // Pre-fill the form
        } else {
          toast.warn("No profile found. Please complete your registration.")
        }
      } catch (err) {
        toast.error("Unexpected error fetching profile")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleUpdate = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, ...formData }, { onConflict: "id" })

      if (error) {
        toast.error(`Failed to update profile: ${error.message}`)
        return
      }

      toast.success("Profile updated successfully!")
      setProfile(formData)
      setIsEditing(false)
    } catch (err) {
      toast.error("Unexpected error updating profile")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

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
            height={150}
            width={150}
            src={formData.avatar_url || "/female_avatar.jpg"}
            alt={`${formData.full_name || "User"}'s profile picture`}
            className="rounded-full w-[150px] h-[150px] object-cover border-4 border-blue-500 shadow-md"
          />
          {isEditing ? (
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="mt-4 text-2xl font-bold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-blue-500 text-center"
              placeholder="Full Name"
            />
          ) : (
            <h2 className="mt-4 text-2xl font-bold text-gray-800">
              {profile.full_name || "Not set"}
            </h2>
          )}
          <p className="text-gray-500 text-sm">{profile.student_id || "Matric not set"}</p>
        </div>

        <div className="mt-8 space-y-4">
          {[
            ["School", "school"],
            ["Department", "department"],
            ["Level", "level"],
            ["Sex", "sex"],
            ["Phone", "phone"],
          ].map(([label, key]) => (
            <div key={key} className="flex flex-col">
              <span className="text-gray-600 font-medium">{label}:</span>
              {isEditing ? (
                key === "sex" ? (
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className="border p-2 rounded mt-1"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="border p-2 rounded mt-1"
                  />
                )
              ) : (
                <span className="text-gray-800">{profile[key] || "Not set"}</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          {isEditing ? (
            <>
              <button
                onClick={handleUpdate}
                className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition mr-3"
              >
                Save
              </button>
              <button
                onClick={() => { setIsEditing(false); setFormData(profile); }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg shadow hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
