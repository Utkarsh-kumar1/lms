"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
const bcrypt = require('bcryptjs');

import SignupSchema from "@/Schema/SignupSchema";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import api from "@/axios";

export default function SignUpForm({ setIsOtpSended, FormData, setFormData }) {
  const [isLogging, setIsLogging] = useState(false);

  const form = useForm({
    resolver: zodResolver(SignupSchema),
    defaultValues: FormData,
  });

  async function onSubmit(data) {
    const { username, email, firstName, lastName, password } = data;
    setFormData(data)
    try {
      setIsLogging(true);
      const response = await api.post("/register", {
        firstName,
        lastName,
        username,
        email,
        password: bcrypt.hashSync(password, 10)
      });
      toast({
        variant: "success",
        title: "Message : ",
        description: response.data.message,
      });
      setIsOtpSended(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error : ",
        description: error.response.data.message,
      });
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className=" px-2 sm:px-4 py-4 "
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-800 dark:text-gray-200 ">
                First Name
              </FormLabel>
              <FormControl>
                <Input
                  className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-400"
                  placeholder="First Name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Last Name
              </FormLabel>
              <FormControl>
                <Input
                  className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-400"
                  placeholder="Last Name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Username
              </FormLabel>
              <FormControl>
                <Input
                  className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-400"
                  placeholder="Username"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-400"
                  placeholder="sample@gmail.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-400"
                  placeholder="Password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-2 rounded-xl shadow-md font-semibold text-sm mt-5 "
          type="submit"
          disabled={isLogging}
        >
          {isLogging ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
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
            "Sign Up"
          )}
        </Button>
      </form>
    </Form>
  );
}
