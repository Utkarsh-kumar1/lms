"use client";
import { LoaderCircle, UserRound } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editableReps, setEditableReps] = useState([]);
  const [originalReps, setOriginalReps] = useState([]);



  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile`);
        const data = await response.json();
        console.log(data);
        
       if (data.success) {
         setProfile(data.data);
         setEditableReps(data.data.spaceRepetition || []);
       } else setError(data.message);
      } catch {
        setError("An error occurred while fetching the profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const startEditing = () => {
    setOriginalReps([...editableReps]); // save a copy
    setEditMode(true);
  };

  const cancelEditing = () => {
    setEditableReps([...originalReps]); // restore original
    setEditMode(false);
  };

  const addNewGap = () => {
    setEditableReps([...editableReps, editableReps[editableReps.length - 1] + 1]);
  };

  const saveSpacedRepetition = async () => {
    try {
      const response = await fetch("/api/spaceRepetation", {
        method: "POST",
        body : JSON.stringify({ spaceRepetation: editableReps }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        setProfile((prev) => ({ ...prev, spaceRepetition: editableReps }));
        setOriginalReps([...editableReps]); // save the new state as original
      } else {
        setError(data.message);
      }
      setEditMode(false);

    }
    catch(error){
      console.error("Error saving spaced repetition:", error);
      setError("An error occurred while saving the spaced repetition.");
    }
  }

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
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
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

          <h1 className="text-4xl font-bold text-gray-800 mt-4">
            {profile.username}
          </h1>
          <p className="text-md text-gray-600">{profile.email}</p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              👤 Basic Information
            </h2>
            <p className="text-gray-700 mb-2">
              <span className="font-medium">First Name:</span>{" "}
              {profile.firstName}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Last Name:</span> {profile.lastName}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Joined:</span>{" "}
              {new Date(profile.created).toLocaleDateString()}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Last Updated:</span>{" "}
              {new Date(profile.lastUpdated).toLocaleDateString()}
            </p>
            <p className="text-gray-700">
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

          {/* Additional Info */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📊 Additional Info
            </h2>
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Activity Count:</span>{" "}
              {profile.activityScheduleCount}
            </p>
            <div className="text-gray-700 mb-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  📈 Spaced Repetition Journey:
                </h2>
                <div className="flex gap-4 mt-4">
                  {editMode ? (
                    <>
                      <button
                        onClick={addNewGap}
                        className="text-sm text-green-600 hover:underline"
                      >
                        ➕ Add Revision Gap
                      </button>
                      <button
                        onClick={saveSpacedRepetition}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        💾 Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-sm text-gray-600 hover:underline"
                      >
                        ❌ Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={startEditing}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>
              </div>

              {editMode ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editableReps.map((gap, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={gap}
                        onChange={(e) => {
                          const updated = [...editableReps];
                          updated[index] = parseInt(e.target.value) || 0;
                          setEditableReps(updated);
                        }}
                        className="w-20 px-3 py-1 rounded-full border text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      <span className="text-gray-500 text-sm">
                        Rev {index + 1}
                      </span>
                      <button
                        onClick={() => {
                          const updated = [...editableReps];
                          updated.splice(index, 1);
                          setEditableReps(updated);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editableReps.length > 0 ? (
                    editableReps.map((gap, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm shadow-sm"
                      >
                        <span className="text-gray-600">{gap}d +</span>
                        <span className="font-semibold">Rev {index + 1}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No revision data available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Placeholder for Tasks */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-10 hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📝 Tasks</h2>
          <p className="text-gray-600">No tasks available yet.</p>
        </div>

        {/* Button */}
        <div className="text-center">
          <button
            onClick={() => alert("comming soon")}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
    