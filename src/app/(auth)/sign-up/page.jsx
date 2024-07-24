"use client";

import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useState } from "react";
import SignUpForm from "@/components/SignUpForm";
import OTPForm from "@/components/OtpForm";

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
    <Card className=" mt-5 w-[30rem] ">
      <CardHeader>
        <CardTitle>{isOtpSended ? "Submit OTP" : "Sign Up"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`transition-opacity duration-1000 ease-in `}
        >
          {!isOtpSended && (
            <SignUpForm
              setIsOtpSended={setIsOtpSended}
              FormData={FormData}
              setFormData={setFormData}
            />
          )}
        </div>
        <div
          className={`transition-opacity duration-1000 ease-linear `}
        >
          {isOtpSended && (
            <OTPForm
              setIsOtpSended={setIsOtpSended}
              userData={FormData}
            />
          )}
        </div>
      </CardContent>
      <CardFooter>{/* Add any footer content here if needed */}</CardFooter>
    </Card>
  );
}
