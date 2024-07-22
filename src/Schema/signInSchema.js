// import { z } from 'zod'

// const usernameValidation = z.string({ required_error: "Username is required" })
//     .min(4, "username must be atleast 4 character")
//     .max(15, "username must be less than 15 character")
//     .regex(/^[a-zA-Z0-9]*$/, "username should not contain the special character")

// const SignInSchema = z.object({
//     username: usernameValidation,
//     email: z.string({ required_error: "Email is required" })
//         .email({ message: "Invalid email address" }),
//     password: z.string({ required_error: "Email is required" })
//         .min(8, "password must contain 8 character")
//         .max(20, "password must contain less than 20 character")
//         .regex(/[A-Za-z]/, "Password must contain atleast one letter ")
//         .regex(/\d/, "Password must contain atleast one digit ")
//         .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain atleast one special character "),
//     //.regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, "Password must contain atleast one letter (either uppercase or lowercase) , atleast one digit , atleast one special character")
// })

// export default SignInSchema


import { z } from 'zod';

const usernameOrEmailValidation = z.string()
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
