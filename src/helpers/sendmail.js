import nodemailer from "nodemailer"

const APP_NAME = "LMS"

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD 
    }
});

export default async function sendUserVeficationMail(user ,sendTo , otp){
    var mailOptions = {
        from: process.env.EMAIL_USER,
        to: sendTo,
        subject: 'Verifiy Account || LMS ',
        html: `<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333333;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border: 1px solid #dddddd;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding: 10px 0;
                    background-color: #007bff;
                    color: #ffffff;
                }
                .content {
                    padding: 20px;
                    text-align: center;
                }
                .otp {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                }
                .footer {
                    text-align: center;
                    padding: 10px 0;
                    color: #999999;
                    font-size: 12px;
                }
            </style>
            </head>
            <body>
            <div class="container">
                <div class="header">
                    <h1>${APP_NAME}</h1>
                </div>
                <div class="content">
                    <p>Dear ${user},</p>
                    <p>Thank you for using ${APP_NAME}. To complete your verification, please use the following One-Time Password (OTP):</p>
                    <p class="otp">${otp}</p>
                    <p>This OTP is valid for only 5 minutes. Please do not share this code with anyone.</p>
                </div>
                <div class="footer">
                    <p>If you did not request this OTP, please ignore this email or contact support.</p>
                </div>
            </div>
            </body>
            </html>
                `, 
    };
    
    return await transporter.sendMail(mailOptions);
    

}
