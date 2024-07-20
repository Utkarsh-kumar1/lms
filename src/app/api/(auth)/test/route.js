import ApiResponse from "@/helpers/ApiResponse";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET()
{
    const token = jwt.sign({ userId: 123, userOtp : 123 }, process.env.JWT_SECRET, { expiresIn: '5m' });

    cookies().set({
        name: 'token',
        value: token,
        httpOnly: true,
        path: '/',
    })
    // Set the token as a cookie
    // const headers = new Headers();
    // headers.append('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=300`);
    return Response.json(ApiResponse.success(200,token, "user created successfully "), { status: 200 });
}