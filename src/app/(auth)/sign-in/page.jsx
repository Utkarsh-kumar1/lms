"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import SignInSchema from "@/Schema/signInSchema";
import { signIn } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function ProfileForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });
  const { toast } = useToast();

  async function onSubmit(data) {
    setIsProcessing(true);
    const response = await signIn("credentials", {
      redirect: false,
      usernameOrEmail: data.usernameOrEmail,
      password: data.password,
    });
    setIsProcessing(false);
    toast({
      variant: !response.ok ? "destructive" : "success",
      title: response.ok ? "Success" : "Error",
      description: response.ok ? "Sign In Successfully" : response.error,
    });
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    
      <Card className="h-auto sm:w-[25rem] backdrop-blur-lg bg-white/10 dark:bg-gray-800/70 rounded-xl shadow-lg p-6">
        <CardHeader className="flex items-center gap-4">
          <Image
            src="/logo.jpeg"
            alt="logo"
            width={50}
            height={50}
            className="rounded-full"
          />
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
            Welcome back!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <div>
              <label className="block font-medium text-gray-800 dark:text-gray-200">
                Username / Email <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("usernameOrEmail")}
                placeholder="sample@gmail.com"
                className="bg-gray-100 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-800 dark:text-gray-200">
                Password <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("password")}
                type="password"
                placeholder="Password"
                className="bg-gray-100 dark:bg-gray-700 dark:text-white"
              />
              <span className="flex justify-end text-xs text-blue-500 dark:text-blue-400 underline">
                Forgot your password?
              </span>
            </div>

            <Button
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:opacity-80 transition-opacity"
              type="submit"
              disabled={isProcessing}
            >
              {isProcessing ? (
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
                "Sign In"
              )}
            </Button>

            <p className="text-gray-700 dark:text-gray-300">
              Don`t have an account?{" "}
              <a
                href="/sign-up"
                className="underline text-blue-500 dark:text-blue-400"
              >
                Register here
              </a>
            </p>
          </form>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
  );
}
