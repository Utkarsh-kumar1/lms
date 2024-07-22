
import CredentialsProvider from "next-auth/providers/credentials"

import bcrypt from "bcrypt"
import dbconnect from "@/lib/dbconnect"
import SignInSchema from "@/Schema/signInSchema"

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
                console.log("credentials" ,credentials);
                try {
                    
                    const validationResponse = SignInSchema.safeParse({ usernameOrEmail: credentials.usernameOrEmail, password: credentials.password})
                    console.log(validationResponse);

                    if(!validationResponse.success)
                    {
                        throw new Error(validationResponse.error.errors[0].message)
                    }

                    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.usernameOrEmail))
                    {
                        try {

                            console.log("credentials");
                            console.log(credentials.usernameOrEmail);
                            //fetching user from the database
                            const [user] = await dbconnect.execute("SELECT id , username , firstName , lastName, userPassword , isVerified from users where email = ?; " , [credentials.usernameOrEmail])
                            console.log("credentials");
                            console.log(user);
                            if(user.length < 1)
                            {
                                throw new Error("No user exists with this email , First Create Account ")
                            }

                            //Check wheather user is verified or not
                            if(user[0].isVerified == false)
                            {
                                throw new Error("Please verify your Account first")
                            }

                            //Check weather the password is Correct
                            const isPasswordCorrect = await bcrypt.compare(credentials.password , user[0].userPassword);
                            console.log(isPasswordCorrect)

                            if(isPasswordCorrect)
                            {
                                const verifiedUser = {
                                    id : user[0].id,
                                    username : user[0].username,
                                    firstName : user[0].firstName,
                                    lastName : user[0].lastName,
                                    email : user[0].email,
                                    isVerified : user[0].isVerified

                                }
                                return verifiedUser;
                            }
                            else{
                                throw new Error("Incorrect password")
                            }

                        } catch (error) {
                            console.log(error);
                            throw new Error( error.message)
                        }
                    }
                    else
                    {
                        try {

                            //fetching user from the database
                         
                            const [user] = await dbconnect.execute("SELECT id , username , firstName , lastName, userPassword , isVerified from users where username = ?; ", [credentials.usernameOrEmail])
                            console.log(user);
                            if (user.length < 1) {
                                throw new Error("No user exists with this username , First Create Account ")
                            }

                            //Check wheather user is verified or not
                            if (user[0].isVerified == false) {
                                throw new Error("Please verify your Account first")
                            }

                            //Check weather the password is Correct
                            const isPasswordCorrect = await bcrypt.compare(credentials.password, user[0].userPassword);
                            console.log(isPasswordCorrect)

                            if (isPasswordCorrect) {
                                const verifiedUser = {
                                    id: user[0].id,
                                    username: user[0].username,
                                    firstName: user[0].firstName,
                                    lastName: user[0].lastName,
                                    email: user[0].email,
                                    isVerified: user[0].isVerified

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
            // console.table([
            //     { "user": JSON.stringify(user)},
            //     { "token": JSON.stringify(token)}
            // ]);
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
            // console.table([
            //     { "Session": JSON.stringify(session) },
            //     { "token": JSON.stringify(token) }
            // ]);
            return session
        },
    },
    pages: {
        signIn: '/sign-in',
    },
    session: {
        jwt : true
    },
    session: {
        jwt: true, // Use JSON Web Tokens for session
    },
    jwt: {
        secret: process.env.JWT_SECRET, // Set a secret for signing the JWT
        encryption: true, // Encrypt the JWT
    },
    secret: process.env.AUTH_SECRET
}