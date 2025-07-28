"use client";

import { useEffect, useState } from "react";

import TickAnimation from "../../../components/TickAnimation";
import api from "@/axios";
import CryptoJS from "crypto-js";
import { passwordValidation } from "@/Schema/signInSchema";

export default function Fpass() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTick, setShowTick] = useState(false);

  const handleNext = async (e) => {
    console.log("entering func");
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = passwordValidation.safeParse(password);

    if (!result.success) {
      //   console.log(result.error.errors[0].message);
      setError(result?.error?.errors[0]?.message);
      return;
    }
    setLoading(true);

    // Your verification logic here
    setError("");

    const encryptedPassword = CryptoJS.AES.encrypt(
      password.trim(),
      process.env.NEXT_PUBLIC_AUTH_SECRET
    ).toString();

    try {
      // Try changing the password

      const data = await api.post("/auth/resetPassword", {
        email: email.trim(),
        newPassword: encryptedPassword.trim(),
        otp: otp.trim(),
      });

      console.log("Data", data);

      if (data?.data?.message.includes("OTP sent")) {
        setOtpSent(true);
        setLoading(false);
      } else if (data?.data?.message.includes("Password reset successfully!")) {
        setShowTick(true);
        setTimeout(() => {
          window.location.href = "/sign-in"; // Redirect to login page after 2 seconds
        }, 2000);
      } else if (data?.data?.message === "User not found") {
        setError("User does not exist");
      } else if (data?.data?.message.includes("Incorrect OTP")) {
        setError("Incorrect OTP");
      }
    } catch (err) {
      // console.error("Error message:", err?.response?.data?.error);
    }

    setLoading(false);
  };

  return (
    <div className=" flex items-center justify-center backdrop-blur-lg bg-white/10 dark:bg-gray-800/70 rounded-xl shadow-lg">
      <div className=" p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          Password Reset
        </h2>

        {!showTick ? (
          <form onSubmit={handleNext} className="space-y-4">
            {/* Email */}
            <input
              type="email"
              placeholder="sample@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Password */}
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Confirm Password */}
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* OTP */}
            {otpSent && (
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}

            {/* Error Messages */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {loading ? "Checking..." : "Next"}
            </button>
          </form>
        ) : (
          <TickAnimation message="Password Reset Successful" />
        )}
      </div>
    </div>
  );
}
