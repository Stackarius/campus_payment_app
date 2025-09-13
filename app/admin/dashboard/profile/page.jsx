"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function EditProfile() {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    matric_no: "",
    school: "",
    department: "",
    phone: "",
    sex: "",
    staff_id: "",
  })

  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [message, setMessage] = useState("")
  const [user, setUser] = useState(null)

  const schools = [
    "Select a School / Faculty",
    "Applied Science",
    "Computing",
    "Business and Management Studies"
  ]

  const departments = {
    "Applied Science": ["Biology", "Chemistry", "Physics", "Mathematics"],
    "Computing": ["Computer Science", "Information Technology", "Software Engineering", "Cybersecurity"],
    "Business and Management Studies": ["Accounting", "Finance", "Marketing", "Human Resources", "Management"]
  }

  const sexOptions = ["Select Gender", "Male", "Female", ]

  // Fetch current user and profile data on component mount
  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        setMessage("Please log in to view your profile")
        setLoadingProfile(false)
        return
      }

      setUser(user)

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        setMessage("Error loading profile data")
      } else if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          email: profileData.email || user.email || "",
          matric_no: profileData.matric_no || "",
          school: profileData.school || "",
          department: profileData.department || "",
          phone: profileData.phone || "",
          sex: profileData.sex || "",
          staff_id: profileData.staff_id || "",
        })
      }
    } catch (err) {
      console.error("Error in fetchUserProfile:", err)
      setMessage("Error loading profile")
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setProfile((prev) => ({
      ...prev,
      [name]: value,
      // Reset department when school changes
      ...(name === "school" && { department: "" })
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // Validation
    if (!profile.full_name.trim()) {
      setMessage("Full name is required")
      setLoading(false)
      return
    }

    if (!profile.email.trim()) {
      setMessage("Email is required")
      setLoading(false)
      return
    }

    if (profile.school === "Select a School / Faculty") {
      setMessage("Please select a school/faculty")
      setLoading(false)
      return
    }

    try {
      // Update profile in database
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name.trim(),
          email: profile.email.trim(),
          school: profile.school,
          department: profile.department,
          phone: profile.phone.trim(),
          sex: profile.sex === "Select Gender" ? "" : profile.sex,
          staff_id: profile.staff_id.trim(),
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      setMessage("Profile updated successfully!")

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage("")
      }, 3000)

    } catch (err) {
      console.error("Error updating profile:", err)
      setMessage("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="p-5 flex justify-center items-center min-h-[200px]">
        <div className="text-lg">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className='p-5 max-w-4xl mx-auto'>
      <h1 className='font-bold text-3xl mb-6 text-gray-800'>My Profile</h1>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.includes('successfully')
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Full Name */}
          <div className='flex flex-col gap-2'>
            <label htmlFor="full_name" className='font-semibold text-gray-700'>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              id="full_name"
              value={profile.full_name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email */}
          <div className='flex flex-col gap-2'>
            <label htmlFor="email" className='font-semibold text-gray-700'>
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={profile.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Phone */}
          <div className='flex flex-col gap-2'>
            <label htmlFor="phone" className='font-semibold text-gray-700'>Phone Number</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={profile.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Gender */}
          <div className='flex flex-col gap-2'>
            <label htmlFor="sex" className='font-semibold text-gray-700'>Gender</label>
            <select
              name="sex"
              id="sex"
              value={profile.sex}
              onChange={handleChange}
              className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              {sexOptions.map((option, index) => (
                <option key={index} value={option} disabled={option === "Select Gender"}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Staff ID (for staff) */}
          <div className='flex flex-col gap-2'>
            <label htmlFor="staff_id" className='font-semibold text-gray-700'>Staff ID</label>
            <input
              type="text"
              name="staff_id"
              id="staff_id"
              value={profile.staff_id}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your staff ID"
            />
          </div>

          {/* School */}
          <div className='flex flex-col gap-2'>
            <label htmlFor="school" className='font-semibold text-gray-700'>
              School / Faculty <span className="text-red-500">*</span>
            </label>
            <select
              name="school"
              id="school"
              value={profile.school}
              onChange={handleChange}
              className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required
            >
              {schools.map((school, index) => (
                <option key={index} value={school} disabled={school === "Select a School / Faculty"}>
                  {school}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className='flex flex-col gap-2'>
            <label htmlFor="department" className='font-semibold text-gray-700'>Department</label>
            <select
              name="department"
              id="department"
              value={profile.department}
              onChange={handleChange}
              className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              disabled={!profile.school || profile.school === "Select a School / Faculty"}
            >
              <option value="">Select Department</option>
              {profile.school && departments[profile.school] &&
                departments[profile.school].map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))
              }
            </select>
          </div>

        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-lg rounded-lg shadow-md px-8 py-3 transition duration-200 ease-in-out transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed'
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  )
}