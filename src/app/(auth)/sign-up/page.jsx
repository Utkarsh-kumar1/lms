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
  

  return (
    <Card className=" w-[18rem] sm:w-[30rem]">
      <CardHeader>
        <CardTitle>{isOtpSended ? "Submit OTP" : "Sign Up"}</CardTitle>
      </CardHeader>
      <CardContent>
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
      <CardFooter>{/* Add any footer content here if needed */}</CardFooter>
    </Card>
  );
}
