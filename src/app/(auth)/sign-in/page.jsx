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
import { useToast } from "@/components/ui/use-toast";
import SignInSchema from "@/Schema/signInSchema";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"; // Make sure this path is correct
import { useRouter } from "next/navigation";
import {useState} from "react";

export default function ProfileForm() {

  const [isProcessing, setisProcessing] = useState(false) 
  
  const router = useRouter()
  const form = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  const { toast } = useToast();

  async function onSubmit(data) {
    setisProcessing(true)
    const response = await signIn("credentials", {
      redirect: false,
      usernameOrEmail: data.usernameOrEmail,
      password: data.password,
    });
    setisProcessing(false)
    toast({
      variant: !response.ok ? "destructive" : "success",
      title: response.ok ? "Success" : "Error",
      description: response.ok ? "Sign In Successfully" : response.error ,
      
    });
    if(response.ok == true)
    {
      router.push("/dashboard");
    }
  }

  return (
    <Card className=" h-auto sm:w-[25rem]">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="usernameOrEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username or Email</FormLabel>
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
            <Button className="bg-indigo-500" type="submit" disabled={isProcessing}>
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
          </form>
        </Form>
      </CardContent>
      <CardFooter>{/* Add any footer content here if needed */}</CardFooter>
    </Card>
  );
}
