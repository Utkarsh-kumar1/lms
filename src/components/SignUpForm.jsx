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

import SignupSchema from "@/Schema/SignupSchema";
import axios from "axios";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

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
      const Response = await axios.post("/api/sign-up", {
        firstName,
        lastName,
        username,
        email,
        password,
      });
      toast({
        variant: "success",
        title: "Message : ",
        description: Response.data.message,
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
    <Form {...form} >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className=" space-y-4 md:space-y-6 "
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="First Name" {...field} />
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
              <FormLabel>last Name</FormLabel>
              <FormControl>
                <Input placeholder="lastName" {...field} />
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
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="sample@gmail.com" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="bg-indigo-500" type="submit" disabled={isLogging}>
          {isLogging ? (
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
            "Sign Up"
          )}
        </Button>
      </form>
    </Form>
  );
}
