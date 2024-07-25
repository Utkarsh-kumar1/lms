"use client";

import { ChevronLeft } from "lucide-react"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import CustomAlertDialog from "./Alert";

const FormSchema = z.object({
  OTP: z
    .string()
    .min(4, {
      message: "Your one-time password must be 4 characters.",
    })
    .regex(/^\d+$/, "OTP only contains digits"),
});

export default function OTPForm({ setIsOtpSended, userData }) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      OTP: "",
    },
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isCounting, setIsCounting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 300 seconds = 5 minutes
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    otpRefs.current[0].focus();
    setIsCounting(true);
    setTimeLeft(300); // Reset to 5 minutes
    setTimeout(() => {
      setIsCounting(false);
    }, 300000);
  }, []); // Dependency array to ensure it runs only once on initial render

  useEffect(() => {
    let interval;

    if (isCounting) {
      interval = setInterval(() => {
        setTimeLeft((prevTimeLeft) => {
          if (prevTimeLeft <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prevTimeLeft - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isCounting]);

  const focusNextInput = (index) => {
    if (index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1].focus();
    }
  };

  const formatTime = (seconds) => {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const remainingSeconds = String(seconds % 60).padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  };

  async function onSubmit(data) {
    try {
      setIsVerifying(true);
      const verifyResponse = await axios.patch("/api/verifyuser", data);
      if (verifyResponse.data.statusCode === 200) {
        toast({
          variant: "success",
          title: "Message:",
          description: verifyResponse.data.message,
        });
        router.push("/sign-in", { scroll: false });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error:",
        description: error.response.data.message,
      });
    } finally {
      setIsVerifying(false);
    }
  }

  async function resendOtp() {
    try {
      setIsResending(true);
      const resendResponse = await axios.post("/api/sign-up/resend-otp", {
        usernameOrEmail: userData.username,
        password: userData.password,
      });
      setIsResending(false);
      setIsCounting(true);
      setTimeLeft(300); // Reset to 5 minutes
      setTimeout(() => {
        setIsCounting(false);
      }, 300000); // Stop countdown after 5 minutes (300,000 milliseconds)
      toast({
        variant: "success",
        title: "Message : ",
        description: resendResponse.data.message,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error:",
        description: error.response.data.message,
      });
    } finally {
      setIsResending(false);
    }
  }

  const handleResendClick = () => {
    setIsAlertDialogOpen(true);
  };

  const handleAlertDialogClose = () => {
    setIsAlertDialogOpen(false);
  };

  const handleAlertDialogAction = () => {
    setIsAlertDialogOpen(false);
    resendOtp();
  };

  return (
    <>

      <Button variant="outline" size="icon" disabled={isVerifying || isResending}
        type="button"
        onClick={() => {
          setIsOtpSended(false);
        }}>
      <ChevronLeft className="h-4 w-4" />
    </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            className="font-bold"
            control={form.control}
            name="OTP"
            render={({ field }) => (
              <FormItem>
                <FormLabel>One-Time Password</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={4}
                    {...field}
                    ref={(el) => (otpRefs.current[0] = el)}
                    onInput={() => focusNextInput(0)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={0}
                        ref={(el) => (otpRefs.current[0] = el)}
                        onInput={() => focusNextInput(0)}
                      />
                      <InputOTPSlot
                        index={1}
                        ref={(el) => (otpRefs.current[1] = el)}
                        onInput={() => focusNextInput(1)}
                      />
                      <InputOTPSlot
                        index={2}
                        ref={(el) => (otpRefs.current[2] = el)}
                        onInput={() => focusNextInput(2)}
                      />
                      <InputOTPSlot
                        index={3}
                        ref={(el) => (otpRefs.current[3] = el)}
                        onInput={() => focusNextInput(3)}
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormDescription>
                  Please enter the one-time password sent to your <span className="text-base font-bold text-black "> {userData.email}</span>.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center justify-between w-full">
              <Button
                className="bg-indigo-500"
                type="submit"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              <Button
                onClick={handleResendClick}
                className="bg-indigo-500"
                type="button"
                disabled={isResending || isCounting}
              >
                {isResending ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Resend OTP"
                )}
              </Button>
            </div>
            {isCounting && (
              <p className="text-red-600 font-bold text-lg font-mono">
                {formatTime(timeLeft)}
              </p>
            )}
          </div>
        </form>
        <CustomAlertDialog
          isOpen={isAlertDialogOpen}
          onClose={handleAlertDialogClose}
          AlertTitle="Resend OTP"
          AlertDescription={
            <>
              <span> Are you sure you want to resend the OTP?</span>
              <span>Re-check you Email</span>
              <span className=" font-bold text-base">
                OTP is valid for 5 Minutes
              </span>
            </>
          }
          AlertCancelbuttonName="Cancel"
          AlertActionButtonName="Resend"
          onAction={handleAlertDialogAction}
        />
      </Form>
    </>
  );
}
