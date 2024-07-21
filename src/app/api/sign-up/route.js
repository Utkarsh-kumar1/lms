import ApiResponse from "@/helpers/ApiResponse";
import SignupSchema from "@/Schema/SignupSchema";
import dbconnect from "@/lib/dbconnect";
import bcrypt from "bcrypt"
import sendUserVeficationMail from "@/helpers/sendmail";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";


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
        console.log(username, email);
        const [userCheckResult] = await dbconnect.execute(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE username = ?) as usernameCount, 
                (SELECT COUNT(*) FROM users WHERE email = ?) as emailCount;
        `, [username, email]);
        
        const { usernameCount, emailCount } = userCheckResult[0];
        
        if (usernameCount > 0) {
            return Response.json(ApiResponse.error(400, "User already exists with this username"), { status: 400 });
        }
        
        if (emailCount > 0) {
            return Response.json(ApiResponse.error(400, "User already exists with this Email"), { status: 400 });
        }
        
    } catch (error) {
        console.log(error.sqlMessage);
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
    let user;
    try {
        const [response] = await dbconnect.execute("INSERT INTO users(username, email ,firstname , lastname , userPassword , otp , otpExpiry) VALUES(?,?,?,?,?,?,?);", [username, email, firstName, lastName, hashedPassword, userOtp, otpExpiry])

        user = await dbconnect.execute("SELECT id, username , email , firstName , lastName from users where id = ? ;", [response.insertId])


    } catch (error) {
        return Response.json(ApiResponse.error(400, error.sqlMessage), { status: 400 })
    }

    const token = jwt.sign({ userId: user[0][0].id,  username: user[0][0].username, userOtp }, process.env.JWT_SECRET, { expiresIn: '5m' });

    cookies().set({
        name: 'token',
        value: token,
        httpOnly: true,
        path: '/',
    })


    return Response.json(ApiResponse.success(200, user[0][0], "user created successfully "), { status: 200});
}