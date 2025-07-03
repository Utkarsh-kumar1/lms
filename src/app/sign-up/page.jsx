// pages/profile.js
"use client";

import React, { useState, Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import SkeletonFallback from "./SkeletonFallback";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
const SignUpForm = React.lazy(() => import("@/components/SignUpForm"));
const OTPForm = React.lazy(() => import("@/components/OtpForm"));

export default function ProfileForm() {
  const [isOtpSended, setIsOtpSended] = useState(false);
  const [FormData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
    const router = useRouter();
    const { user } = useAuth();
    if (user) {
      // If user is logged in, redirect to dashboard
      router.push("/dashboard");
      return null; // Prevent rendering the landing page
    }
  

  return (
    <Card className="w-full max-w-sm sm:max-w-md rounded-xl bg-white/30 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-gray-700 transition-all">
      <CardHeader className="text-center py-3">
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {isOtpSended ? "Enter OTP" : "Create an Account"}
        </CardTitle>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {isOtpSended
            ? "We’ve sent a verification code to your email."
            : "Start your productivity journey with Ignify."}
        </p>
      </CardHeader>

      <CardContent className="px-5 py-2 sm:px-6">
        <div className="transition-opacity duration-1000 ease-in">
          {!isOtpSended && (
            <Suspense fallback={<SkeletonFallback />}>
              <SignUpForm
                setIsOtpSended={setIsOtpSended}
                FormData={FormData}
                setFormData={setFormData}
              />
            </Suspense>
          )}
        </div>
        <div className="transition-opacity duration-1000 ease-linear">
          {isOtpSended && (
            <Suspense fallback={<SkeletonFallback />}>
              <OTPForm setIsOtpSended={setIsOtpSended} userData={FormData} />
            </Suspense>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-center gap-2 py-1 text-sm text-gray-700 dark:text-gray-300">
        <span>Already have an account?</span>
        <a
          href="/sign-in"
          className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
        >
          Login here
        </a>
      </CardFooter>
    </Card>
  );
}
