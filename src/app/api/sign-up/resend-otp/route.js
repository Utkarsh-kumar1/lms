import ApiResponse from "@/helpers/ApiResponse";
import bcrypt from "bcrypt";
import sendUserVeficationMail from "@/helpers/sendmail";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import SignInSchema from "@/Schema/signInSchema";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request) {
    // get username or email and password
    const { usernameOrEmail, password } = await request.json();

    // validate the usernameOrEmail and password
    const validationResponse = SignInSchema.safeParse({ usernameOrEmail, password });
    if (!validationResponse.success) {
        return Response.json(ApiResponse.error(400, validationResponse.error.errors[0].message), { status: 400 });
    }

    // check for user by username or email
    let user;
    try {
        const userData = await db.query.users.findFirst({
            where: (user, { eq, or }) => or(
                eq(user.username, usernameOrEmail),
                eq(user.email, usernameOrEmail),
            )
        })


        if (!userData) {
            return Response.json(ApiResponse.error(400, "User not found"), { status: 400 });
        }



        // Check if the OTP is expired
        const currentDate = new Date();
        const otpExpiry = new Date(userData.otpExpiry)
        if (currentDate.getTime() < otpExpiry.getTime()) {
            return Response.json(ApiResponse.error(400, "Current OTP is still valid"), { status: 400 });
        }

        // check if password is correct
        const isPasswordValid = bcrypt.compareSync(password, userData.userPassword);
        if (!isPasswordValid) {
            return Response.json(ApiResponse.error(400, "Invalid password"), { status: 400 });
        }



        // Proceed with generating and sending new OTP

        // create new otp
        const randomNumber = Math.floor(Math.random() * 10000).toString();
        const newOtp = randomNumber.padStart(4, '0');

        // create otp expiry
        const newCurrentDate = new Date()
        const newOtpExpiry = new Date(currentDate.getTime());
        newOtpExpiry.setMinutes(newCurrentDate.getMinutes() + 5);

        // send new otp to email
        try {
            await sendUserVeficationMail(user.firstName + " " + user.lastName, user.email, newOtp);
        } catch (error) {
            return Response.json(ApiResponse.error(500, "Error while sending Mail"), { status: 500 });
        }

        // update otp and otpExpiry in the database
        try {

            await db
                .update(users)
                .set(
                    {
                        otp: newOtp,
                        otpExpiry: otpExpiry
                    }
                )
                .where(
                    eq(users.id, userData.id)
                )

            // generate a new token
            const token = jwt.sign({ userId: userData.id, username: userData.username, userOtp: newOtp }, process.env.JWT_SECRET, { expiresIn: '5m' });

            cookies().set({
                name: 'token',
                value: token,
                httpOnly: true,
                path: '/',
            });

            return Response.json(ApiResponse.success(200, { username: user.username, email: user.email }, "OTP Resent successfully"), { status: 200 });
        } catch (error) {
            return Response.json(ApiResponse.error(400, error.sqlMessage), { status: 400 });
        }



    } catch (error) {
        return Response.json(ApiResponse.error(400, "Error while connecting to Database"), { status: 400 });
    }


}
