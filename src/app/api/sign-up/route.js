import ApiResponse from "@/helpers/ApiResponse";
import SignupSchema from "@/Schema/SignupSchema";
import bcrypt from "bcrypt"
import sendUserVeficationMail from "@/helpers/sendmail";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";


export async function POST(request) {
    // get username , email and password
    const { username, email, firstName, lastName, password } = await request.json();

    // validate the username , email , password
    const validationResponse = SignupSchema.safeParse({ username, email, password, firstName, lastName })
    if (!validationResponse.success) {
        return Response.json(ApiResponse.error(400, validationResponse.error.errors[0].message), { status: 400 })
    }

    // check for unique username and email
    //check for user by username
    try {

        const user = await db.query.users.findFirst({
            where: (user, { eq, or }) => or(
                eq(user.username, username),
                eq(user.email, email),
            )
        })

        if (user) {
            //is user exists by username
            if (user.username === username) {
                return Response.json(ApiResponse.error(400, "User already exists with this username"), { status: 400 });
            }
            //is user exists by email
            if (user.email === email) {
                return Response.json(ApiResponse.error(400, "User already exists with this Email"), { status: 400 });
            }
        }
    } catch (error) {

        return Response.json(ApiResponse.error(400, "Error while connection to Database"), { status: 400 })
    }

    // Proceed with user creation since neither username nor email exists

    // hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // create otp
    const randomNumber = Math.floor(Math.random() * 10000).toString()
    const userOtp = randomNumber.padStart(4, '0');

    // create otp expiry
    const currentDate = new Date();
    const otpExpiry = new Date(currentDate.getTime());
    otpExpiry.setMinutes(currentDate.getMinutes() + 5);

    // send otp to email
    try {
        await sendUserVeficationMail(firstName + " " + lastName, email, userOtp)

    } catch (error) {
        return Response.json(ApiResponse.error(500, "Error while sending Mail"), { status: 500 })

    }
    // save it to db {Username , Email , Password , Otp , OtpExpiry} 
    try {

        const insertedUser = await db
            .insert(users)
            .values({
                username,
                email,
                firstName,
                lastName,
                userPassword: hashedPassword,
                otp: userOtp,
                otpExpiry: otpExpiry
            }).$returningId();

        const user = await db.query.users.findFirst({
            columns: {
                userPassword: false
            },
            where: (user, { eq }) => eq(user.id, insertedUser[0].id)
        });


        const token = jwt.sign({ userId: user.id, username: user.username, userOtp: user.otp }, process.env.JWT_SECRET, { expiresIn: '5m' });

        cookies().set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // only send over HTTPS
            sameSite: 'strict',  // prevent CSRF
            path: '/',
        });



        return Response.json(ApiResponse.success(200, user, "Sign-up Successfull "), { status: 200 });


    } catch (error) {
    console.error("Database insert error:", error);
    return Response.json(ApiResponse.error(500, "Internal Server Error"), { status: 500 });
}



}