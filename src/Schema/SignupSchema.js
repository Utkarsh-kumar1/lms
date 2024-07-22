import { z } from 'zod'

const usernameValidation = z.string({ required_error: "Username is required" })
    .min(4, "username must be atleast 4 character")
    .max(15, "username must be less than 15 character")
    .regex(/^[a-zA-Z0-9]*$/, "username should not contain the special character")

const SignupSchema = z.object({
    username: usernameValidation,
    email: z.string({ required_error: "Email is required" })
        .email({ message: "Invalid email address" }),
    password: z.string({ required_error: "Password is required" })
        .min(8, "password must contain 8 character")
        .max(20, "password must contain less than 20 character")
        .regex(/[A-Za-z]/, "Password must contain atleast one letter ")
        .regex(/\d/, "Password must contain atleast one digit ")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain atleast one special character "),
    //.regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, "Password must contain atleast one letter (either uppercase or lowercase) , atleast one digit , atleast one special character")
    firstName: z.string({ required_error: "firstName is required" })
        .regex(/^[^0-9]+$/ , "Name should not contains the digits")
        .regex(/^[a-zA-Z0-9]+$/ , "Name should not contains the special character"),
    lastName: z.string({ required_error: "lastName is required" })
        .regex(/^[^0-9]+$/, "Name should not contains the digits")
        .regex(/^[a-zA-Z0-9]+$/, "Name should not contains the special character"), 
})

export default SignupSchema