'use client'

import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user and profile data
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          toast.error("Please log in to view your profile");
          return;
        }
        setUserId(userData.user.id);

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, student_id, school, department, level, phone, sex")
          .eq("id", userData.user.id)
          .single();

        if (profileError) {
          toast.error(`Failed to fetch profile: ${profileError.message}`);
          console.error("Supabase profile error:", profileError);
          return;
        }

        if (profileData) {
          setProfile(profileData);
        } else {
          toast.warn("No profile found. Please complete your registration.");
        }
      } catch (err) {
        toast.error("Unexpected error fetching profile");
        console.error("Unexpected error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-semibold text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-semibold text-red-600">Please log in to view your profile.</div>
      </div>
    );
  }

  return (
    <div className="flex p-6">
      <div className="p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h2>
        {profile ? (
          <div className="space-y-3">
            <Image
              height={100}
              width={100}
              src={profile.avatar_url || "/female_avatar.jpg"}
              alt="Student profile image"
              className="rounded-full w-[200px] h-[200px] object-fit border-2 border-blue-600 mt-10 mb-8"
            />
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Full Name:</span>
              <span className="text-gray-800">{profile.full_name || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Matric Number:</span>
              <span className="text-gray-800">{profile.student_id || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">School:</span>
              <span className="text-gray-800">{profile.school || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Department:</span>
              <span className="text-gray-800">{profile.department || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Level:</span>
              <span className="text-gray-800">{profile.level || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Sex:</span>
              <span className="text-gray-800 capitalize">{profile.sex || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Phone:</span>
              <span className="text-gray-800">{profile.phone || "Not set"}</span>
            </div>
          </div>
        ) : (
          <p className="text-center text-red-600">No profile data available. Please complete your registration.</p>
        )}
      </div>
    </div>
  );
}