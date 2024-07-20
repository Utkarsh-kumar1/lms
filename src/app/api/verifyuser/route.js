
import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
import ApiResponse from '@/helpers/ApiResponse'
import { z } from "zod";
import dbconnect from '@/lib/dbconnect';

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
    //check for otp in token and otp in request should be same
    if (decodedToken.userOtp !== OTP) {
        return Response.json(ApiResponse.error(400, "OTP is invalid"), { status: 400 })
    }

    //check for otp expiry
    let data;
    try {
        [data] = await dbconnect.execute("select otp , otpExpiry from users where id = ?", [decodedToken.userId || null])
    } catch (error) {
        return Response.json(ApiResponse.error(400, error.sqlMessage), { status: 400 })
    }

    if (data.length == 0) {
        return Response.json(ApiResponse.error(400, "Wrong token"), { status: 400 })
    }
    const otpExpiry = new Date(data[0].otpExpiry);
    const currentDate = new Date();

    if (currentDate.getTime() > otpExpiry.getTime()) {
        return Response.json(ApiResponse.error(400, "Otp expired || timed out"), { status: 400 })
    }

    //match the otp from database
    if (OTP !== data[0].otp) {
        return Response.json(ApiResponse.error(400, "Invalid otp"), { status: 400 })
    }
    //if otp expiry and otp are true the marked user verified in db
    try {
        const update = await dbconnect.execute("UPDATE users SET isVerified = True , otp = null where id = ?", [decodedToken.userId])
    } catch (error) {
        return Response.json(ApiResponse.error(400, error.sqlMessage), { status: 400 })
    }

    let updateduser;
    try {
        [updateduser] = await dbconnect.execute("SELECT id , userName , email , firstName , lastName from users where id = ?", [decodedToken.userId])

    } catch (error) {
        return Response.json(ApiResponse.error(400, error.sqlMessage), { status: 400 })
    }

    return Response.json(ApiResponse.success(200, updateduser[0], "User verified successfully"), { status: 200 })

}