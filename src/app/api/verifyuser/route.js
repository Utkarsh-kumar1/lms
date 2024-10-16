
import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
import ApiResponse from '@/helpers/ApiResponse'
import { z } from "zod";
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const otpSchema = z.object({
    OTP: z.string({ required_error: "Username is required" })
        .max(4, "it should contains maximum value ")
        .min(4, "it should contains minimun value")

})

export async function PATCH(request) {
    //get jwt token from user and check it
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    let decodedToken;
    if (!token) {
        return Response.json(ApiResponse.error(400, "Something went wrong || clear cookies and try again "), { status: 400 });
        }
    try {
        decodedToken = jwt.verify(token.value, process.env.JWT_SECRET);
    } catch (error) {
        return Response.json(ApiResponse.error(400, error.message), { status: 400 })
    }

    //get opt from the request
    const { OTP } = await request.json();
    const otpValidation = otpSchema.safeParse({ OTP })
    if (!otpValidation.success) {
        return Response.json(ApiResponse.error(400, otpValidation.error.errors[0].message), { status: 400 })
    }
    //check for otp expiry
    try {
        const data = await db.query.users.findFirst({
            where: (user, { eq }) => eq(user.id, decodedToken.userId)

        })

        if (data.isVerified == true) {
            return Response.json(ApiResponse.error(400, "User is already Verified"), { status: 400 })
        }

        //check for otp in token and otp in request should be same
        if (decodedToken.userOtp !== OTP) {
            return Response.json(ApiResponse.error(400, "OTP is invalid"), { status: 400 })
        }

        if (!data) {
            return Response.json(ApiResponse.error(400, "Wrong token"), { status: 400 })
        }
        const otpExpiry = new Date(data.otpExpiry);
        const currentDate = new Date();

        if (currentDate.getTime() >= otpExpiry.getTime()) {
            return Response.json(ApiResponse.error(400, "Otp expired || timed out"), { status: 400 })
        }

        //match the otp from database
        if (OTP !== data.otp) {
            return Response.json(ApiResponse.error(400, "Invalid otp"), { status: 400 })
        }
        //if otp expiry and otp are true the marked user verified in db
        try {

            await db.update(users).set({ isVerified: true, otp: null }).where(eq(users.id, decodedToken.userId))
            try {
                const updateduser = await db.query.users.findFirst({
                    where: (user, { eq }) => eq(user.id, decodedToken.userId)
                })
                return Response.json(ApiResponse.success(200, updateduser, "User verified successfully"), { status: 200 })
            } catch (error) {
                return Response.json(ApiResponse.error(400, error.sqlMessage), { status: 400 })
            }

        } catch (error) {

            return Response.json(ApiResponse.error(400, error.sqlMessage), { status: 400 })
        }

    } catch (error) {

        return Response.json(ApiResponse.error(400, error.sqlMessage), { status: 400 })
    }

}