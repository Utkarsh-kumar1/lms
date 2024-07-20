import ApiResponse from "@/helpers/ApiResponse";
import SignupSchema from "@/Schema/SignupSchema";
import dbconnect from "@/lib/dbconnect";
import bcrypt from "bcrypt"
import sendUserVeficationMail from "@/helpers/sendmail";



export async function POST(request) {
    // get username , email and password
    const { username, email, firstName, lastName, password } = await request.json();
    console.log(username, email, password)

    // validate the username , email , password
    const validationResponse = SignupSchema.safeParse({ username, email, password, firstName, lastName })
    if (!validationResponse.success) {
        console.log(validationResponse.error.errors[0].message);
        return Response.json(ApiResponse.error(400, validationResponse.error.errors[0].message), { status: 400 })
    }

    // check for unique username and email
    console.log(username)
    //check for user by username
    try {
        const [userByUsername] = await dbconnect.execute('SELECT username FROM users WHERE username = ?', [username]);
        if (userByUsername.length > 0) {
            return Response.json(ApiResponse.error(400, "User already exists with this username"), { status: 400 })
        }
        //check for user by email
        const [userByEmail] = await dbconnect.execute('SELECT username FROM users WHERE username = ?', [email]);
        if (userByEmail.length > 0) {
            return Response.json(ApiResponse.error(400, "User already exists with this Email"), { status: 400 })
        }
    } catch (error) {
        return Response.json(ApiResponse.error(400, "Error while connection to Database"), { status: 400 })
    }

    // hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // create otp
    const randomNumber = Math.floor(Math.random() * 10000).toString()
    const userOtp = randomNumber.padStart(4, '0');
    console.log(userOtp);

    // create otp expiry
    const currentDate = new Date();
    const otpExpiry = new Date(currentDate.getTime());
    otpExpiry.setMinutes(currentDate.getMinutes() + 5);

    console.log('Current Date:', currentDate);
    console.log('OTP Expiry:', otpExpiry);

    // send otp to email
    try {
        await sendUserVeficationMail(firstName+" "+lastName,email, userOtp)

    } catch (error) {
        console.log(error);
        return Response.json(ApiResponse.error(500, "Error while sending Mail"), { status: 500 })

    }
    // save it to db {Username , Email , Password , Otp , OtpExpiry} 
    let user;
    try {
        const [response] = await dbconnect.execute("INSERT INTO users(username, email ,firstname , lastname , userPassword , otp , otpExpiry) VALUES(?,?,?,?,?,?,?);", [username, email, firstName, lastName, hashedPassword, userOtp, otpExpiry])

        user = await dbconnect.execute("SELECT username , email , firstName , lastName from users where id = ? ;", [response.insertId])


    } catch (error) {
        return Response.json(ApiResponse.error(400, error.sqlMessage), { status: 400 })
    }


    return Response.json(ApiResponse.success(200, user[0][0], "user created successfully "), { status: 200 });
}