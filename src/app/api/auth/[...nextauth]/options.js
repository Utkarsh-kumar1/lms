
import CredentialsProvider from "next-auth/providers/credentials"

import bcrypt from "bcrypt"
import dbconnect from "@/lib/dbconnect"
import SignInSchema from "@/Schema/signInSchema"
import { db } from "@/db/drizzle"

export const authOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: 'Credentials',
            credentials: {
                usernameOrEmail: {},
                password: {}
            },
            async authorize(credentials, req) {
                try {

                    const validationResponse = SignInSchema.safeParse({ usernameOrEmail: credentials.usernameOrEmail, password: credentials.password })

                    if (!validationResponse.success) {
                        throw new Error(validationResponse.error.errors[0].message)
                    }

                    const fieldName = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.usernameOrEmail) ? "email" : "username";




                    // const pool = dbconnect();

                    // const [user] = await pool.execute(`SELECT id , username , firstName , lastName, userPassword , isVerified from users where ${fieldName} = ?; `, [credentials.usernameOrEmail])

                    const user = await db.query.users.findFirst({
                        where: (user, { eq, and,or, sql }) =>or(
                            eq(user.username, credentials.usernameOrEmail),
                            eq(user.email, credentials.usernameOrEmail),
                        )
                    })

                    console.log(user);
                    

                    if (!user) {
                        throw new Error(`No user exists with this ${fieldName} , First Create Account `)
                    }

                    //Check wheather user is verified or not
                    if (user.isVerified == false) {
                        throw new Error("Please verify your Account first")
                    }

                    //Check weather the password is Correct
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.userPassword);


                    if (isPasswordCorrect) {
                        const verifiedUser = {
                            id: user.id,
                            userName: user.username,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            isVerified: user.isVerified

                        }
                        return verifiedUser;

                    }
                    else {
                        throw new Error("Incorrect password")
                    }




                } catch (error) {
                    throw new Error(error.message)
                }

            }
        })
    ],
    callbacks: {

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.isVerified = user.isVerified
                token.userName = user.userName
                token.firstName = user.firstName
                token.lastName = user.lastName
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.id = token.id
                session.isVerified = token.isVerified
                session.userName = token.userName
                session.firstName = token.firstName
                session.lastName = token.lastName
            }
            return session
        },
    },
    pages: {
        signIn: '/sign-in',
    },
    session: {
        jwt: true
    },

    jwt: {
        secret: process.env.JWT_SECRET, // Set a secret for signing the JWT
        encryption: true, // Encrypt the JWT
    },
    secret: process.env.AUTH_SECRET
}