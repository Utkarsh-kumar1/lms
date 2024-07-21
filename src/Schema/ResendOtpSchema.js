import { z } from "zod";

const ResendOtpSchema = z.object({
  usernameOrEmail: z
    .string({ required_error: "Username or Email is required" })
    .min(4, "Username or Email must be atleast 4 character"),

  password: z.string({ required_error: "Password is required" }),
});

export default ResendOtpSchema;
