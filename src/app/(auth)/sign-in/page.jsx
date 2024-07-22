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

export default function ProfileForm() {
  const form = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  const { toast } = useToast();

  async function onSubmit(data) {
    console.log(data);
    const response = await signIn("credentials", {
      redirect: false,
      usernameOrEmail: data.usernameOrEmail,
      password: data.password,
    });
    console.log(response);
    toast({
      variant: !response.ok ? "destructive" : "",
      title: response.ok ? "Success" : "Error",
      description: response.error,
    });
  }

  return (
    <Card>
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
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>{/* Add any footer content here if needed */}</CardFooter>
    </Card>
  );
}
