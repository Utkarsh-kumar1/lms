"use client";
import api from "@/axios";
import { LoaderCircle, UserRound } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/userProfile");
        // console.log(response?.data);

        //  if (response.success) {
        setProfile(response?.data?.user);
        //  } else setError(data.message);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("An error occurred while fetching the profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-500  w-full h-full flex items-center justify-center">
        <LoaderCircle className=" animate-spin" />
      </div>
    );
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-md rounded-2xl shadow-xl p-8">
        {/* Avatar + Username */}
        <div className="text-center mb-8">
          {profile?.avatarUrl ? (
            <Image
              src={profile?.avatarUrl}
              alt="User Avatar"
              width={128}
              height={128}
              className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg border-4 border-white"
            />
          ) : (
            <div className="w-32 h-32 mx-auto bg-gray-200 flex items-center justify-center rounded-full text-gray-500 shadow-inner">
              <UserRound className="w-16 h-16" />
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mt-4">
            {profile.username}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">
            {profile.email}
          </p>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            👤 Basic Information
          </h2>
          <p className="text-gray-700 mb-2 text-sm sm:text-base">
            <span className="font-medium">First Name:</span> {profile.firstName}
          </p>
          <p className="text-gray-700 mb-2 text-sm sm:text-base">
            <span className="font-medium">Last Name:</span> {profile.lastName}
          </p>
          <p className="text-gray-700 mb-2 text-sm sm:text-base">
            <span className="font-medium">Joined:</span>{" "}
            {new Date(profile.created).toLocaleDateString()}
          </p>
          <p className="text-gray-700 mb-2 text-sm sm:text-base">
            <span className="font-medium">Last Updated:</span>{" "}
            {new Date(profile.lastUpdated).toLocaleDateString()}
          </p>
          <p className="text-gray-700 text-sm sm:text-base">
            <span className="font-medium">Verified:</span>{" "}
            <span
              className={
                profile.isVerified
                  ? "text-green-600 font-semibold"
                  : "text-red-600 font-semibold"
              }
            >
              {profile.isVerified ? "Yes ✅" : "No ❌"}
            </span>
          </p>
        </div>

        {/* Button */}
        {/* <div className="text-center">
          <button
            onClick={() => alert("comming soon")}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
          >
            ✏️ Edit Profile
          </button>
        </div> */}
      </div>
    </div>
  );
}

export default ProfilePage;
