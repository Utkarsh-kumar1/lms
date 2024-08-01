import ApiResponse from "@/helpers/ApiResponse";
import dbconnect from "@/lib/dbconnect";
import bcrypt from "bcrypt";
import sendUserVeficationMail from "@/helpers/sendmail";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import SignInSchema from "@/Schema/signInSchema";

export async function POST(request) {
    // get username or email and password
    const { usernameOrEmail, password } = await request.json();

    // validate the usernameOrEmail and password
    const validationResponse = SignInSchema.safeParse({ usernameOrEmail, password });
    if (!validationResponse.success) {
        return Response.json(ApiResponse.error(400, validationResponse.error.errors[0].message), { status: 400 });
    }

    // check if the input is an email or username
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail);
    const queryField = isEmail ? "email" : "username";

    // check for user by username or email
    let user;
    try {
        const pool = dbconnect();
        const [userCheckResult] = await pool.execute(`
            SELECT id, username, email, userPassword, firstName, lastName, otp, otpExpiry 
            FROM users 
            WHERE ${queryField} = ?;
        `, [usernameOrEmail]);
        
        if (userCheckResult.length === 0) {
            return Response.json(ApiResponse.error(400, "User not found"), { status: 400 });
        }
        
        user = userCheckResult[0];

        // Check if the OTP is expired
        const currentDate = new Date();
        const otpExpiry = new Date(user.otpExpiry)
        if (currentDate.getTime() < otpExpiry.getTime()) {
            return Response.json(ApiResponse.error(400, "Current OTP is still valid"), { status: 400 });
        }
        
        // check if password is correct
        const isPasswordValid = bcrypt.compareSync(password, user.userPassword);
        if (!isPasswordValid) {
            return Response.json(ApiResponse.error(400, "Invalid password"), { status: 400 });
        }
        
    } catch (error) {
        return Response.json(ApiResponse.error(400, "Error while connecting to Database"), { status: 400 });
    }
    
    

    // Proceed with generating and sending new OTP

    // create new otp
    const randomNumber = Math.floor(Math.random() * 10000).toString();
    const newOtp = randomNumber.padStart(4, '0');

    // create otp expiry
    const currentDate = new Date()
    const otpExpiry = new Date(currentDate.getTime());
    otpExpiry.setMinutes(currentDate.getMinutes() + 5);

    // send new otp to email
    try {
        await sendUserVeficationMail(user.firstName + " " + user.lastName, user.email, newOtp);
    } catch (error) {
        return Response.json(ApiResponse.error(500, "Error while sending Mail"), { status: 500 });
    }

    // update otp and otpExpiry in the database
    try {
        const pool = dbconnect();
        await pool.execute(`
            UPDATE users 
            SET otp = ?, otpExpiry = ? 
            WHERE id = ?;
        `, [newOtp, otpExpiry, user.id]);
    } catch (error) {
        return Response.json(ApiResponse.error(400, error.sqlMessage), { status: 400 });
    }

    // generate a new token
    const token = jwt.sign({ userId: user.id, username: user.username, userOtp: newOtp }, process.env.JWT_SECRET, { expiresIn: '5m' });

    cookies().set({
        name: 'token',
        value: token,
        httpOnly: true,
        path: '/',
    });

    return Response.json(ApiResponse.success(200, { username: user.username, email: user.email }, "OTP Resent successfully"), { status: 200 });
}
