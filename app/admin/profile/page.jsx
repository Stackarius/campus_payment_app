"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient';

export default function EditProfile() {

  const school = [
    "Select a School / Faculty",
    "Applied Science",
    "Computing",
    "Business and Management Studies"
  ]

  const [profile, setProfile] = useState({
    fullname: "",
    email: "",
    matric_no: "",
    school: ""
  })

  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault() // prevent forms submission

    try {

      const { error } = await supabase
        .from("profiles")
        .update([{
          full_name: profile.fullname,
          email: profile.email,
          phone: profile.phone,
        }]);

      if (error) throw error;

      alert("Profile saved successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className='p-5'>
      <h1 className='font-bold text-2xl'>My Profile</h1>

      {/* Form showing profile details */}
      <form onSubmit={handleSubmit} className="bg-gray-100 px-4 py-4 mt-6 rounded w-full md:w-[500px]">
        {/* Name */}
        <div className='flex flex-col gap-1'>
          <label htmlFor="fullname" className='font-semibold'>Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={profile.fullname}
            onChange={handleChange}
            className="w-full p-1 border rounded mb-4" />
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor="matric" className='font-semibold'>Email</label>
          <input
            type="text"
            name="matric"
            id="matric"
            value={profile.email}
            onChange={handleChange}
            className="w-full p-1 border rounded mb-4" />
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor="matric" className='font-semibold'>Matric No</label>
          <input
            type="text"
            name="matric"
            id="matric"
            value={profile.matric_no}
            onChange={handleChange}
            className="w-full p-1 border rounded mb-4" />
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor="department" className='font-semibold'>School / Faculty</label>
          <select id="department" className='border p-1 rounded mb-4'>
            {school.map((sch, index) => (
              <option key={index} value={sch}>{sch}</option>
            ))}
          </select>
        </div>

        <button className='block bg-blue-600 text-white font-semibold text-md rounded shadow px-4 py-2 ml-auto'>Update Profile</button>
      </form>
    </div>
  )
}
