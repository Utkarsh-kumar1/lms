
import { z } from 'zod';

const usernameOrEmailValidation = z.string({ required_error: "Username or Email  is required" })
    .min(1, "Username or email is required")
    .refine(value => {
        const isUsername = /^[a-zA-Z0-9]{4,15}$/.test(value);
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        return isUsername || isEmail;
    },  "Must be a valid username or email",
    );

const passwordValidation = z.string({ required_error: "Password is required" })
    .min(8, "Password must contain at least 8 characters")
    .max(20, "Password must contain less than 20 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/\d/, "Password must contain at least one digit")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

const SignInSchema = z.object({
    usernameOrEmail: usernameOrEmailValidation,
    password: passwordValidation
});

export default SignInSchema;
